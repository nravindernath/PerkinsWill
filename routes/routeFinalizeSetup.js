var util = require('../public/util');
var project = require("../model/project");
var async = require('async');
var error_const = require('./error_constants.js');
var jwt = require('jsonwebtoken');
var logger = require("../public/logger");
var config = require('../public/config');

var projDetails = {};
var cus_id;
var proj_id;
exports.finalizeSetup = function routefinalizeSetup(req, res, next) {
    
    
    StartFinalizeSetup(req, res, next);
   
    //--------------------------
    
    //projDetails = req.body;
    //CreateProjectTeamCollaborations(projDetails, function (err, success) {
    //    if (err) {
    //        res.status(500).json(util.showMessage(err.message));
    //    } else {
    //        res.status(200).json(success);
    //    }
    //});


    //projDetails = req.body;

    //getFolderItems('10991540132', function (err, success) {
    //    if (err) {
    //        res.status(500).json(util.showMessage(err.message));
    //    } else {
    //        res.status(200).json(success);
    //    }
    //});

    //CreateMembership({ "box_app_user_id": "311889596"},'5375418', function (err, success) {
    //    if (err) {
    //        res.status(500).json(util.showMessage(err.message));
    //    } else {
    //        res.status(200).json(success);
    //    }
    //});
    
    //CreateCollaboration('5439322','11064146928', function (err, success) {
    ////CreateCollaboration({ "exec_only_group_id": "5393322","exec_only_folder_id":"10990222350"},function (err, success) {
    //    if (err) {
    //        res.status(500).json(util.showMessage(err.message));
    //    } else {
    //        res.status(200).json(success);
    //    }
    //});

   
    //GetBoxUser('316891414', function (err, success) {
    //    if (err) {
    //        res.status(500).json(util.showMessage(err.message));
    //    } else {
    //        res.status(200).json(success);
    //    }
    //});

    
    //var proj = req.body;
    //updateProjects(res,proj);
    //CreateCollaboration()

    //CreateBoxUser({ 'email_address': 'AppUser_234790_Bbi7boftqQ@boxdevedition.com', 'name': '5795734_customer_user1@boa.com' }, function (err, success){
    //      if (err) {
    //        res.status(500).json(util.showMessage(err.message));
    //    } else {
    //        res.status(200).json(success);
    //    }
    //});

    //getToken('320280463', function (err, success) {
    //if (err) {
    //    res.status(500).json(util.showMessage(err.message));
    //} else {
    //    res.status(200).json(success);
    //}
    //});

}


function StartFinalizeSetup(req, res, next) {
    logger.log('info', 'Starting finalize Settings');
    cus_id = req.params.customerId;
    proj_id = req.params.projectId;

    async.waterfall([
        getProjectDetails,
        getCustomerName,
        CreateProjectFolder,
        CreateExecFolder,
        CreateAllUserFolder,
        CreateExecGroup,
        CreateAllUserGroup,
        CreateProjectTeamUsers,
        CreateCustomerTeamUsers,
        CreateProjectTeamMemberShip,
        CreateProjectTeamCollaborations,
        CreateCustomerTeamCollaborations,
        UpdateProjectsIntoMongo
    ], function (err, success) {
        if (err) {
            logger.log('error', 'error in final call-', err.message);
            res.status(500).json(util.showMessage(err.message));
            next();
        } else {
            logger.log('info', 'Completed finalize Settings-final response');
            res.status(200).json(util.showMessage('sucess'));
            next();
        }
    });
}


var getProjectDetails = function (next) {
    //var proj_id = req.params.projectId;
    if (proj_id) {
        var id = parseInt(proj_id);
        var project = require("../model/project");
        
        project.find({ project_id: id }, util.exculdeFields, function (err, proj) {
            if (err) {
                next(err, null);
            } else {
                
                if (proj.length > 0) {
                    
                    //req.customer_detail = proj[0];
                    
                    var stringProj = JSON.stringify(proj[0]);
                    projDetails = JSON.parse(stringProj);
                    projDetails.box_logs = projDetails.box_logs || {};
                    logger.log('info', 'Finalize Setup Input-', JSON.stringify(projDetails));
                    next(null, projDetails);
                }
                else {
                    next({ name: 'No customers found!' }, null);
                }
            }
        });
    }
    else {
        next({ name: 'Invalid request!' }, null);
    }
}



function UpdateProjectsIntoMongo(proj, callback) {
    var pid = proj.project_id;
    var project = require("../model/project");
    project.findOneAndUpdate({ project_id: pid }, proj, function (err, project1) {
        if (err) {
            logger.log('error','updating into Mongo:'+err.message);
            //res.status(500).json(util.showMessage(err.message));
        }
        callback(null,project1);
        //res.status(200).json(project1);
    });
}



//function updateProjects(res,proj) {
    
//    var pid = proj.project_id;

//    var project = require("../model/project");
    
//    project.findOneAndUpdate({ project_id: pid }, proj, function (err, project1) {
//        if (err) { 
        
//            res.status(500).json(util.showMessage(err.message));
//        }
//        res.status(200).json(project1);
//    });
//}

//,CreatExecOnlyCollaboration

//get customer details
function getCustomerName(req, callback) {
    //return function (callback) {  //*change made
    //var cus_id = req.params.customerId;
    if (cus_id) {
        
        var id = parseInt(cus_id);
        var customer = require("../model/customer");
        
        customer.find({ customer_id: id }, util.exculdeFields, function (err, customer) {
            if (err) {
                callback(err, null);
            } else {
                
                if (customer.length > 0) {
                    var stringCus = JSON.stringify(customer[0]);
                    req.customer_detail =JSON.parse(stringCus);
                    callback(null, req);
                }
                else {
                    callback({ name: 'No customers found!'}, null);
                }
            }
        });
    }
    else {
        callback({ name: 'Invalid request!' }, null);
    }
}

//get project details
//function getProjectDetails(req, callback) {
//    return function (callback) {  //*change made
//        //var proj_id = req.params.projectId;
//        if (proj_id) {
//            var id = parseInt(proj_id);
//            var project = require("../model/project");
            
//            project.find({ project_id: id }, util.exculdeFields, function (err, proj) {
//                if (err) {
//                    callback(err, null);
//                } else {
                    
//                    if (proj.length > 0) {
                        
//                        //req.customer_detail = proj[0];
                        
//                        var stringProj =JSON.stringify(proj[0]);
//                        projDetails = JSON.parse(stringProj);
//                        projDetails.box_logs = projDetails.box_logs || {};
//                        callback(null, projDetails);
//                    }
//                    else {
//                        callback({ name: 'No customers found!' }, null);
//                    }
//                }
//            });
//        }
//        else {
//            callback({ name: 'Invalid request!' }, null);
//        }
//    }
//}


function CreateProjectTeamUsers(req, callback) {
    var proj_team = req.project_team;
    async.forEach(proj_team, function (el, arrayCallback) {
        var index = proj_team.indexOf(el);
        var box_id=proj_team[index].box_app_user_id;
        if (util.isStringBlank(box_id)) {
            CreateBoxUser(proj_team[index], function (err, user) {
                if (err) { }
                //var index = proj_team.indexOf(el);
                req.project_team[index].box_app_user_id = user?user.id:'';
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


// Create customer user into BOX
function CreateCustomerTeamUsers(req, callback) {
    var proj_team = req.customer_team;
    async.forEach(proj_team, function (el, arrayCallback) {
        var index = proj_team.indexOf(el);
        var box_id = proj_team[index].box_app_user_id;
        if (util.isStringBlank(box_id)) {
            CreateBoxUser(proj_team[index], function (err, user) {
                if (err) { }
                //var index = proj_team.indexOf(el);
                req.customer_team[index].box_app_user_id = user?user.id:'';
                arrayCallback(null, req);
            })
        }
        else {
            arrayCallback(null, req);
        }
    }, function (err) {
        if (err) { callback(err, null); }
        else {
            callback(null, req);
        }
    });
}



function CreateCustomerFolder(req, callback) {
    return function (callback) {
        var box_id=req.customer_detail.box_folder_id;
         if (util.isStringBlank(box_id)) {
            var customerName=req.customer_detail.customer_name
            CreateBoxFolder('0', customerName, function(err,folder) {
                if (err) {
                    //logger.log('error', err.message);
                    callback(err, null);
                }
                else {
                    req.customer_detail.box_folder_id = folder.id;
                    callback(null, req);
                }
            });
        }
        else{
            callback(null, req);
        }
    }
}


function CreateProjectFolder(req, callback) {
    var box_id = req.project_detail.box_folder_id;
    if (util.isStringBlank(box_id)) {
        var parentId = req.customer_detail.box_root_folder_id;
        var fName = req.project_detail.project_name+'-'+req.project_detail.project_id;
        //req.project_detail.project_name+
        CreateBoxFolder(parentId, fName, function (err, res) {
            if (err) {
                //callback(err, null);
            }
            req.project_detail.box_folder_id = res?res.id:'';
            callback(null, req);
        });
    }
    else {
        callback(null, req);
    }
}

//******************************************************
//start - creating sub folders

function CreateExecFolder(req, callback) {
    var box_id = req.box_logs.exec_only_folder_id;
    if (util.isStringBlank(box_id)) {
        var parentId = req.project_detail.box_folder_id;
        CreateBoxFolder(parentId, 'Exec-only content', function (err, res) {
            if (err) {
                //callback(err, req);
                logger.log('error', err.message);
            }
            req.box_logs.exec_only_folder_id = res?res.id:'';
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
            req.box_logs.all_users_folder_id = res?res.id:'';
			box_id = req.box_logs.all_users_folder_id;
			
			var adminAPIClient = util.getBOXAPIClient(true, config.ADMIN_ID);
			
			adminAPIClient.folders.create(box_id, "Presentation", function (err, subFolder) {
				adminAPIClient.folders.create(box_id, "Contracts", function (err, subFolder) {
					adminAPIClient.folders.create(box_id, "Ideas", function (err, subFolder) {
						adminAPIClient.folders.create(box_id, "Mic", function (err, subFolder) {
            callback(null, req);
        });
					});
				});
			});
			
            
        });
    } else {
        callback(null, req);
    }
}

//end - creating sub folders
//**********************************************************


//*******************************************************
//start - creating groups
var CreateExecGroup = function (req, callback) {
    var box_id = req.box_logs.exec_only_group_id;
    if (util.isStringBlank(box_id)) {
        var groupName = 'Exec-only-' + req.project_detail.project_name + '-' + req.project_detail.project_id;
        CreateGroup(groupName, function (err, res) {
            if (err) {
                //callback(err, req);
            }
            req.box_logs.exec_only_group_id = res?res.id:'';
            callback(null, req);
        });
    } else {
        callback(null, req);
    }
}

function CreateAllUserGroup(req, callback) {
        var groupName = 'All-Users-' + req.project_detail.project_name + '-' + req.project_detail.project_id;
    var box_id = req.box_logs.all_users_group_id;
    if (util.isStringBlank(box_id)) {
    CreateGroup(groupName, function (err, res) {
            if (err) {
                //callback(err, req);
        }
        req.box_logs.all_users_group_id = res?res.id:'';
            callback(null, req);
        });
    } else {
        callback(null, req);
    }

}

//end - creating groups


//creating membership
function CreateProjectTeamMemberShip(req, callback) {
    var proj_team = req.project_team;
    var group_id = req.box_logs.exec_only_group_id;
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
function CreateCollaboration(grpId,folderId, callback) {
//function CreateCollaboration(box_info, callback) {
    var adminAPIClient = util.getBOXAPIClient(true, config.ADMIN_ID);
    //var adminAPIClient = util.getBOXAPIClient(false, config.ENTERPRISE_ID);

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
 
    //adminAPIClient.collaborations.createWithGroupID('5402674','11015582171', adminAPIClient.collaborationRoles.EDITOR, (function (err, data) {
    adminAPIClient.collaborations.createWithGroupID(grpId, folderId, adminAPIClient.collaborationRoles.EDITOR, (function (err, data) {
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
    
//adminAPIClient.folders.get(id,{
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
        var box_id = proj_team[index].box_collaboration_id;
        if (util.isStringBlank(box_id)) {
            CreateUserFolderCollaboration(proj_team[index], folder_id, function (err, user) {
                if (err) { }
                //var index = proj_team.indexOf(el);
                req.project_team[index].box_collaboration_id = user?user.id:'';
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

//creating customer collaborations
function CreateCustomerTeamCollaborations(req, callback) {
    var proj_team = req.customer_team;
    //var folder_id = req.box_logs.all_users_folder_id;
    async.forEach(proj_team, function (el, arrayCallback) {
        var index = proj_team.indexOf(el);
        var box_id = proj_team[index].box_collaboration_id;
        logger.log('info', 'customer team role-', proj_team[index].role);
        var folder_id = proj_team[index].role === 'Executive'?req.box_logs.exec_only_folder_id:req.box_logs.all_users_folder_id;
        if (util.isStringBlank(box_id)) {
            CreateUserFolderCollaboration(proj_team[index], folder_id, function (err, user) {
                if (err) { }
                //var index = proj_team.indexOf(el);
                req.customer_team[index].box_collaboration_id = user?user.id:'';
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


function CreateUserFolderCollaboration(team, folder_id,callback) {
    var adminAPIClient = util.getBOXAPIClient(true, config.ADMIN_ID);
    //https://github.com/box/box-node-sdk/blob/master/docs/collaborations.md#add-a-collaboration
    //adminAPIClient.collaborations.createWithGroupID('320280463', '11011337401', adminAPIClient.collaborationRoles.EDITOR, (function (err, data) {
    adminAPIClient.collaborations.createWithUserID(team.box_app_user_id, folder_id, adminAPIClient.collaborationRoles.EDITOR, (function (err, data) {
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
