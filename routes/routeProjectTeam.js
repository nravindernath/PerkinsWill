var util = require('../public/util');
var project = require("../model/project");
var async = require('async');
var logger = require("../public/logger");


exports.getProjectTeamByProjID = function getProjectTeamByProjID(req, res, next) {
    
    var groupProjectTeam = function(result,next){

        //console.log("result in grouping",result);
        var groupObj = {};
        var teams = [];
        teams = result.entries;

        teams.forEach(function (team) {
               if (!groupObj[team.group]) {
                   groupObj[team.group] = [];
               }
               //console.log("TEAM",team);
               var editTeam = JSON.parse(JSON.stringify(team));
               editTeam.photo = editTeam.photograph;
               var address1 = {
                                "street_address1": "410 N. Michigan Ave.",
                                "street_address2": "Chicago, IL 60611"
                };
                editTeam.address = address1;
                editTeam.email = editTeam.email_address;
                if(editTeam.title === "CEO"){
                    editTeam.title_expanded = "Cheif Executive Offier";
                }else{
                    editTeam.title_expanded = editTeam.title;
                }
                delete editTeam.auth0_user_id;
               delete editTeam.photograph;
               delete editTeam.email_address;
               delete editTeam._id;
               delete editTeam.group;
               //console.log("TEAM after update",editTeam);
               groupObj[team.group].push(editTeam);
        });

        //console.log("groupObj",groupObj); 
        result.project_team = groupObj;
        next(null,result);
    };

    async.waterfall([
        getCustomerName(req),
        asyncGetProjectTeam,
        groupProjectTeam,
        function (resp) {
            res.status(200).json(resp);
        }
    ], function (error, success) {
        if (error) {
            res.status(500).json(util.showMessage(error.name));
        }
    });
};

function getCustomerName(req, callback) {
    return function (callback) {
        
        var cus_id = req.params.customerId;
        if (cus_id) {
            
            var id = parseInt(cus_id);
            var customer = require("../model/customer");
            
            customer.find({ customer_id: id }, util.exculdeFields, function (err, customer) {
                if (err) {
                    callback(err, null);
                    //res.status(400).json(util.showMessage('error:' + err.name));
                } else {
                    
                    if (customer.length > 0) {
                        callback(null, req, customer[0]);
                    }
                    else {
                        callback({ name: 'No records found!' }, null);
                    }
                }
            });
        }
        else {
            callback({ name: 'Invalid params!' }, null);
        }
    }
}

function asyncGetProjectTeam(req, customer, callback) {
    var proj_id = req.params.projectId;
    if (proj_id) {
        var id = parseInt(proj_id);
        var query = project.findOne({ 'project_id': id });
        query.select('-_id project_detail project_team');
        query.exec(function (err, projTeam) {
            if (err) {
                callback(err, null);
            } else {
                
                if (projTeam) {
                    var resp = {};
                    resp.customer_name = customer.customer_name;
                    resp.customer_id = customer.customer_id;
                    resp.project_name = projTeam.project_detail.project_name;
                    resp.project_id = projTeam.project_detail.project_id;
                    resp.total_count = projTeam.project_team.length;
                    resp.entries = projTeam.project_team;
                    callback(null, resp);
                }
                else {
                    callback({ name: 'No records found!' }, null);
                }
            }
        });
    }
    else {
        callback({ name: 'Invalid params!' }, null);
    }
}

exports.updateProjectTeam = function updateProjectTeam(req,res,next){

    console.log("Update Project Team request receieved");
    logger.log('info', 'Update Project team-Request-', JSON.stringify(req.body));
    var projectid = req.params.projectId;
    var projectTeamArray = req.body;
    var id = parseInt(projectid);
    var updatequery = {$set: { "project_team": projectTeamArray }};
    var update_record = {
        "project_id" : id
    };

    project.update(update_record,updatequery,function(err,projTeam){
        if(err){
            console.error("error updating",err);
            res.status(500).json(err);

        }else{
            if(projTeam.n > 0){
                res.status(200).json(util.showMessage('Project team updated successfully'));
            }else{
                res.status(500).json(util.showMessage('No matching record found'));
            }
        }
    }); 
    
};
