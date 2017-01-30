var util = require('../public/util');
var project = require("../model/project");
var async = require('async');
var error_const = require('./error_constants.js');
var jwt = require('jsonwebtoken');
var logger = require("../public/logger");
var config = require('../public/config');

var projDetails = {};
var cus_folder_id;
var proj_id;
var cus_id;
exports.createProjectsFolders = function createProjectsFolders(req, res, next) {
    cus_id = req.params.customerId;
    cus_folder_id = req.params.folderId;
    projDetails = req.body;
    projDetails.box_logs= req.body.box_logs||{};

    //parent_id = req.params.folderId;
    //proj_id = req.body.project_id;
    //proj_id = req.body.project_name;
    
    async.waterfall([
        CreateProjectFolder(projDetails),
        CreateExecFolder,
        CreateAllUserFolder,
        CreatePresentationFolder,
        CreateContractorsFolder,
        CreateProjectIntoMongo,
        GetProjectById
    ], function (err, resp) {
        if (err) {
            res.status(500).json(util.showMessage(err.message));
        } else {
            res.status(200).json(resp);
        }
    });
}


function CreateProjectIntoMongo(req, callback) {
    
    //var cus_id = req.params.customerId;
    //var cus_name = req.body.customer_name;
    var p_id = req.project_detail.project_id;
    var p_details = req.project_detail;
    var notification_list = req.notifications || {};
    var proj_team = req.project_team || [];
    var cus_team = req.customer_team || [];
    var _goals = req.goals || {};
    var _status = req.status || {};
    var _boxLogs = req.box_logs || {};
    //it will be update during final setup
    //var _boxLogs = {
    //    'exec_only_group_id': '',
    //    'all_users_group_id': '',
    //    'exec_only_folder_id': '',
    //    'all_users_folder_id': ''
    //};
    
    if (p_details && notification_list) {
        var _project = new project({ customer_id: cus_id, project_id: p_id, project_detail: p_details, notifications: notification_list, project_team: proj_team, customer_team: cus_team, goals: _goals, status: _status, box_logs: _boxLogs });
        //var _project = new project({customer_id: cus_id,project_id: p_id, project_detail: p_details, notifications: [], project_team: [],customer_team: [],goals:[],status: {} });        
        //change made
        var isProjectidExist = function (next) {
            var isProject = 0;
            
            project.find({ project_id: p_id }, util.exculdeFields, function (err, proj) {
                if (err) {
                    res.status(400).json(util.showMessage('error:' + err.name));
                } else {
                    
                    if (proj.length > 0) {
                        
                        isProject = 1;
                        next(null, isProject);
                    }
                    else {
                        next(null, isProject);
                    }
                }
            });


        };
        
        
        var insertProject = function (isProject, next) {
            
            if (isProject === 0) {
                
                _project.save(function (err, userObj) {
                    if (err) {
                        next(err, []);
                    } else {
                        console.log("inserted");
                        next(err, userObj);
                    }
                });
            } else {
                var errObj = util.createError(error_const.PROJECTEXIST);
                next(errObj, null);
            }
        };
        
        var finalResult = function (err, result) {
            if (err) {
                //res.status(400).json(err);
                callback(err,null);
            } else {
                callback(null, result);
                //res.status(200).json(result);//try userObj and handle error
            }

        };
        
        async.waterfall([isProjectidExist, insertProject], finalResult);
    }
    else {
        callback({'message':'Invalid params!'}, null);
        //res.status(400).json(util.showMessage('Invalid params!'));
    }
}


function GetProjectById(req,callback) {
    var proj_id = req.project_detail.project_id;
    if (proj_id) {
        
        var id = parseInt(proj_id);
        
        project.find({ project_id: id }, util.exculdeFields, function (err, proj) {
            if (err) {
                callback(err,null);
                //res.status(400).json(util.showMessage('error:' + err.name));
            } else {
                
                if (proj.length > 0) {
                    
                    callback(null, proj[0]);
                    //res.status(200).json(proj[0]);
                }
                else {
                    callback({'message':'No records found!'}, null);
                    //res.status(400).json(util.showMessage('No records found!'));
                }
            }
        });
    }
    else {
        callback({ 'message': 'Invalid params!' }, null);
        //res.status(400).json(util.showMessage('Invalid params!'));
    }
}

//function CreateProjectFolder(req, callback) {
//    return function (callback) {
//        var box_id = req.project_detail.box_folder_id;
//        if (util.isStringBlank(box_id)) {
//            var parentId = cus_folder_id;
//            var fName = req.project_detail.project_name + '-' + req.project_detail.project_id;
//            //req.project_detail.project_name+
//            CreateBoxFolder(parentId, fName, function (err, res) {
//                if (err) {
//                    callback(err, null);
//                }
//                {
//                    req.project_detail.box_folder_id = res.id || '';
//                    callback(null, req);
//                }
//            });
//        }
//        else {
//            callback(null, req);
//        }
//    }
//}

//******************************************************
//start - creating sub folders

var CreateProjectFolder = function (data, next) {
    return function (next) {
        var box_id = data.project_detail.box_folder_id;
        if (util.isStringBlank(box_id)) {
            var parentId = cus_folder_id;
            var fName = data.project_detail.project_name + '-' + data.project_detail.project_id;
            //req.project_detail.project_name+
            CreateBoxFolder(parentId, fName, function (err, res) {
                if (err) {
                    next(err, null);
                }
                {
                    data.project_detail.box_folder_id = res.id || '';
                    next(null, data);
                }
            });
        }
        else {
            next(null, data);
        }
    }
}


function CreateExecFolder(req, callback) {
    var box_id = req.box_logs.exec_only_folder_id;
    if (util.isStringBlank(box_id)) {
        var parentId = req.project_detail.box_folder_id;
        CreateBoxFolder(parentId, 'Exec-only content', function (err, res) {
            if (err) {
                //callback(err, req);
                logger.log('error', err.message);
                res = {};
                res.id = '123456'; //just simulating the id
            }
            req.box_logs.exec_only_folder_id = res.id || '';
            //callback(null, req, res);
            callback(null, req);
        });
    } else {
        callback(null, req);
    }
}

function CreateAllUserFolder(req, callback) {
    var box_id = req.box_logs.all_users_folder_id;
    if (util.isStringBlank(box_id)) {
        var parentId = req.box_logs.exec_only_folder_id;
        CreateBoxFolder(parentId, 'All users – content', function (err, res) {
            if (err) {
                //callback(err, null);
                logger.log('error', err.message);
            }
            req.box_logs.all_users_folder_id = res.id || '';
            callback(null, req);
        });
    } else {
        callback(null, req);
    }
}

function CreatePresentationFolder(req, callback) {
    var box_id ='';
    if (util.isStringBlank(box_id)) {
        var parentId = req.box_logs.all_users_folder_id;
        CreateBoxFolder(parentId, 'Presentation', function (err, res) {
            if (err) {
                //callback(err, null);
                logger.log('error', err.message);
            }
            req.box_logs.box_presentation_folder_id = res.id || '';
            callback(null, req);
        });
    } else {
        callback(null, req);
    }
}
function CreateContractorsFolder(req, callback) {
    var box_id = '';
    if (util.isStringBlank(box_id)) {
        var parentId = req.box_logs.all_users_folder_id;
        CreateBoxFolder(parentId, 'Contractors', function (err, res) {
            if (err) {
                //callback(err, null);
                logger.log('error', err.message);
            }
            req.box_logs.box_contracts_folder_id = res.id || '';
            callback(null, req);
        });
    } else {
        callback(null, req);
    }
}


// Creating folders into BOX
function CreateBoxFolder(parentId,folderName,callback) {
    var adminAPIClient = util.getBOXAPIClient(true, config.ADMIN_ID);

    //adminAPIClient.folders.getItems(parentId, {
    //    fields: 'name'
    //}, function (err, folder) {
    //    if (err) throw err;
    //    console.log('Hello, ' + folder + '!');
    //});
    adminAPIClient.folders.create(parentId, folderName, function (err, folder) {
        if (err) {
            logger.log('error', 'error in folder creation:'+err.message);
            callback(err,null);
        }
        else {
            logger.log('info', 'Created folderName:' + folder.name);
            callback(null, folder);
        }
    });
}


// Creating user into BOX
function CreateBoxUser(user, callback) {
    var adminAPIClient = util.getBOXAPIClient(false, config.ENTERPRISE_ID);
    
    var requestParams = {
        body: {
            name: user.email_address,
            is_platform_access_only: true
        }
    };
    
    //var requestParams = {
    //               login: user.email_address,
    //    name: user.name,

    //  };

    
    adminAPIClient.post('/users', requestParams, adminAPIClient.defaultResponseHandler(function (err, data) {
        if (err) {
            logger.log('error', 'User creation error:'+err.message);
            callback(err, null);
        }
        else {
            logger.log('info', 'Created BOX user:' + data.name);
            callback(null, data);
        }
    }));
}


// Creating user into BOX
// ref: https://docs.box.com/reference#create-a-group
function CreateGroup(gname, callback) {
    var adminAPIClient = util.getBOXAPIClient(false, config.ENTERPRISE_ID);
    
    var requestParams = {
        body: {
            name: gname,
            invitability_level: 'admins_and_members',
            member_viewability_level:'admins_only'
        }
    };
    
    adminAPIClient.post('/groups', requestParams, adminAPIClient.defaultResponseHandler(function (err, data) {
        if (err) {
            logger.log('error', 'Group creatiion error:'+err.message);
            callback(err, null);
        }
        else {
            logger.log('info', 'The group is created:' + data.name);
            callback(null, data);
        }
    }));
}


// Creating membership 
function CreateMembership(user,groupId, callback) {
    var adminAPIClient = util.getBOXAPIClient(false, config.ENTERPRISE_ID);
    
    var requestParams = {
        body: {
            user: {id: user.box_app_user_id},
            group: { id: groupId },
            role:'admin'
        }
    };
    
    adminAPIClient.post('/group_memberships', requestParams, adminAPIClient.defaultResponseHandler(function (err, data) {
        if (err) {
            logger.log('error', 'Membership creation error:' + err.message);
            callback(err, null);
        }
        else
            {
           logger.log('info', 'Membership created, the id is:' + data.id);
            callback(null, data);
        }
    }));
}




// Creating collaboration
function CreateCollaboration(box_info, callback) {
    var adminAPIClient = util.getBOXAPIClient(true, config.ADMIN_ID);
    
    //adminAPIClient.collaborations()

    //var requestParams = {
    //    body: {
    //        item: { id: box_info.exec_only_folder_id,type:'folder' },
    //        accessible_by: { id: box_info.exec_only_group_id, type: 'group'  },
    //        role: 'viewer'
    //    }
    //};
    
    //adminAPIClient.post('/collaborations', requestParams, adminAPIClient.defaultResponseHandler(function (err, data) {
    //    if (err) {
    //        logger.log('error', 'collaboration creation error:' + err.message);
    //        callback(err, null);
    //    }
    //    else {
    //        logger.log('info', 'collaboration, the id is:' + data.id);
    //        callback(null, data);
    //    }
    //}));
    //https://github.com/box/box-node-sdk/blob/master/docs/collaborations.md#add-a-collaboration
    //adminAPIClient.collaborations.createWithUserID('320280463', '11011337401', adminAPIClient.collaborationRoles.EDITOR, (function (err, data) {
    adminAPIClient.collaborations.createWithGroupID('5402674','11015582171', adminAPIClient.collaborationRoles.EDITOR, (function (err, data) {
        if(err) {
            logger.log('error', 'collaboration creation error:' + err.message);
            callback(err, null);
        }
        else {
            logger.log('info', 'collaboration, the id is:' + data.id);
            callback(null, data);
        }
    }));

}

function GetCollaboration(callback) {
    ////return function (callback) {
    //    var adminAPIClient = util.getBOXAPIClient(true, config.ADMIN_ID);
    //    adminAPIClient.get('/collaborations', adminAPIClient.defaultResponseHandler(function (err, data) {
    //        if (err) {
    //            logger.log('error', 'collaboration creation error:' + err.message);
    //            callback(err, null);
    //        }
    //        else {
    //            logger.log('info', 'collaboration, the id is:' + data.id);
    //            callback(null, data);
    //        }
    //    }));
    ////}
}


// Creating collaboration into BOX
function CreatExecOnlyCollaboration(req, callback) {
    
    var box = req.box_logs;

    CreateCollaboration(box, function(err, res) {
        if (err) {
            //callback(err, null);
            logger.log('error', err.message);
        }
        req.box_logs.exec_only_group_collaboration_id = res?res.id:'';
        callback(null, req);
    });
}





//******************************************************
//for testing purpose only
function getFolderItems(id,callback) {
 var adminAPIClient = util.getBOXAPIClient(true, config.ADMIN_ID);

adminAPIClient.folders.getItems(id, {
    fields: 'name'
}, function (err, folder) {
        if (err) { 
            callback(err, null);
        }
        else {
           callback(null, folder);
        }
    });
}

function GetBoxUser(id, callback) {
    var adminAPIClient = util.getBOXAPIClient(false, config.ENTERPRISE_ID);
    adminAPIClient.users.get(id, {}, function (err, data){    //adminAPIClient.get('/users', adminAPIClient.defaultResponseHandler(function (err, data) {
        if (err) {
            //logger.log('error', 'User creation error:' + err.message);
            callback(err, null);
        }
        else {
            //logger.log('info', 'Created BOX user:' + data.name);
            callback(null, data);
        }
    });
}


function getToken(appUserId,callback) {
    
    var adminAPIClient = util.getBOXAPIClient(false, config.ENTERPRISE_ID);
    
    adminAPIClient._session.tokenManager.getTokensJWTGrant('user', appUserId, function (err, accesstokenInfo) {
        if (err) {
            //console.log(err);
            callback(err, null);
        }
        
        //callback(null, accesstokenInfo);
        var BoxSDK = require('box-node-sdk');
        var sdk = new BoxSDK({
            clientID: config.CLIENT_ID,
            clientSecret: config.CLIENT_SECRET
        });
        var token = accesstokenInfo.accessToken;
        var box = sdk.getBasicClient(token);
        
        // Get some of that sweet, sweet data! 
        //box.users.get(box.CURRENT_USER_ID, null, function(err, currentUser) {
        //    if(err) //throw err;
        //        console.log('Hello, ' + currentUser.name + '!');
        //    callback(null, currentUser);
        //});

        box.folders.get('11011060655', {},function(err, currentUser) {
    if (err) //throw err;
        console.log('Hello, ' + currentUser.name + '!');
    callback(null, currentUser);
});
        
    });
}
//******************************************************


//creating membership
function CreateProjectTeamCollaborations(req, callback) {
    var proj_team = req.project_team;
    var folder_id = req.box_logs.all_users_folder_id;
    async.forEach(proj_team, function (el, arrayCallback) {
        var index = proj_team.indexOf(el);
        var box_id = proj_team[index].box_group_membership_id;
        if (util.isStringBlank(box_id)) {
            CreateMembership(proj_team[index], group_id, function (err, user) {
                if (err) { }
                //var index = proj_team.indexOf(el);
                req.project_team[index].box_group_membership_id = user?user.id:'';
                arrayCallback(null, req);
            })
        }
        else {
            arrayCallback(null, req);
        }
    }, function (err) {
        //if (err) { callback(err, null); }
        //else {
        //    callback(null, req);
        //}
        callback(null, req);
    });
}
