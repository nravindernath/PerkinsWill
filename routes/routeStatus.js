var util = require('../public/util');
var project = require("../model/project");
var async = require('async');
var logger = require("../public/logger");


exports.getStatusByProjID = function getStatusByProjID(req, res, next) {
    async.waterfall([
        getCustomerName(req),
        asyncGetStatus,
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

function asyncGetStatus(req, customer, callback) {
    var proj_id = req.params.projectId;
    if (proj_id) {
        var id = parseInt(proj_id);
        var query = project.findOne({ 'project_id': id });
        query.select('-_id project_detail status');
        query.exec(function (err, _status) {
            if (err) {
                console.error(err);
                callback(err, null);
            } else {
                
                if (_status) {
                    var resp = {};
                    resp.customer_name = customer.customer_name;
                    resp.customer_id = customer.customer_id;
                    resp.project_name = _status.project_detail.project_name;
                    resp.project_id = _status.project_detail.project_id;
                    resp.overall_status = _status.status.overall_status;
                    resp.phase_collection = {};
                    resp.phase_collection.total_count = _status.status.phase_collection.length;
                    resp.phase_collection.entries = _status.status.phase_collection;
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

exports.updateStatus = function updateStatus(req,res,next){
    logger.log('info', 'Update status-Request-', JSON.stringify(req.body));
    console.log("UpdateGoals request receieved");
    var projectid = req.params.projectId;
    var statusArray = req.body;
    var id = parseInt(projectid);
    var updatequery = {$set: { "status": statusArray }};
    var update_record = {
        "project_id" : id
    };

    
    project.update(update_record,updatequery,function(err,projstatus){
        if(err){
            console.error("error updating",err);
            res.status(500).json(err);

        }else{
            if(projstatus.n > 0){
                res.status(200).json(util.showMessage('Status updated successfully'));
            }else{
                res.status(500).json(util.showMessage('No matching record found'));
            }
        }
    }); 
    
};