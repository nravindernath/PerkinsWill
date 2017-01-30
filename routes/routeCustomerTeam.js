var util = require('../public/util');
var project = require("../model/project");
var async = require('async');
var logger = require("../public/logger");


exports.getCustomerTeamByProjID = function getCustomerTeamByProjID(req, res, next) {
    async.waterfall([
        getCustomerName(req),
        asyncGetCustomerTeam,
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

function asyncGetCustomerTeam(req, customer, callback) {
    var proj_id = req.params.projectId;
    if (proj_id) {
        var id = parseInt(proj_id);
        var query = project.findOne({ 'project_id': id });
        query.select('-_id project_detail customer_team');
        query.exec(function (err, custTeam) {
            if (err) {
                callback(err, null);
            } else {
                
                if (custTeam) {
                    var resp = {};
                    resp.customer_name = customer.customer_name;
                    resp.customer_id = customer.customer_id;
                    resp.project_name = custTeam.project_detail.project_name;
                    resp.project_id = custTeam.project_detail.project_id;
                    resp.total_count = custTeam.customer_team.length;
                    resp.entries = custTeam.customer_team;
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


exports.updateCustomerTeam = function updateCustomerTeam(req,res,next){

    logger.log('info', 'Update Customer team-Request-', JSON.stringify(req.body));
    console.log("Update Customer Team request receieved");
    var projectid = req.params.projectId;
    var customerArray = req.body;
    var id = parseInt(projectid);
    var updatequery = {$set: { "customer_team": customerArray }};
    var update_record = {
        "project_id" : id
    };

    project.update(update_record,updatequery,function(err,projTeam){
        if(err){
            console.error("error updating",err);
            res.status(500).json(err);

        }else{
            if(projTeam.n > 0){
                res.status(200).json(util.showMessage('Customer team updated successfully'));
            }else{
                res.status(500).json(util.showMessage('No matching record found'));
            }
        }
    }); 
    
};

