var util = require('../public/util');
var project = require("../model/project");
var async = require('async');
var logger = require("../public/logger");


exports.getNotificationsByProjID = function getNotificationsByProjID(req, res, next) {
    async.waterfall([
        getCustomerName(req),
        asyncGetAllNotifications,
        function (notification) {
            res.status(200).json(notification);
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
                        callback(null, req,customer[0]);
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

function asyncGetAllNotifications(req,customer, callback) {
    var proj_id = req.params.projectId;
    if (proj_id) {
        var id = parseInt(proj_id);
        var query = project.findOne({ 'project_id': id });
        query.select('-_id project_detail notifications');
        query.exec(function (err, notification) {
            if (err) {
                callback(err, null);
            } else {
                
                if (notification) {
                    var resp = {};
                    resp.customer_name = customer.customer_name;
                    resp.customer_id = customer.customer_id;
                    resp.project_name = notification.project_detail.project_name;
                    resp.project_id = notification.project_detail.project_id;
                    resp.total_count = notification.notifications.length;
                    resp.entries = notification.notifications;
                    callback(null, resp);
                }
                else {
                    callback({ name: 'No records found!' }, null);
                }
            }
        });
    }
    else {
        //res.status(400).json(util.showMessage('Invalid params!'));
        callback({ name: 'Invalid params!' }, null);
    }
}


exports.updateNotifications = function updateNotifications(req,res,next){

    logger.log('info', 'Update Notification-Request-', JSON.stringify(req.body));
    console.log("UpdateNotifications request receieved");
    var projectid = req.params.projectId;
    var notificationArray = req.body;
    var id = parseInt(projectid);
    var updatequery = {$set: { "notifications": notificationArray }};
    var update_record = {
        "project_id" : id
    };

    project.update(update_record,updatequery,function(err,projnotif){
        if(err){
            console.error("error updating",err);
            res.status(500).json(err);

        }else{
            if(projnotif.n > 0){
                res.status(200).json(util.showMessage('Notification updated successfully'));
            }else{
                res.status(500).json(util.showMessage('No matching record found'));
            }
        }
    }); 
    
};

exports.addNotifications = function addNotifications(req,res,next){

    logger.log('info', 'Add Notification-Request-', JSON.stringify(req.body));
    var projectid = req.params.projectId;
    var notificationObj = req.body;
    var id = parseInt(projectid);

    var update_record = {
        "project_id" : id
    };

    var currentDate = new Date();
    var day = currentDate.getDate();
    var month = currentDate.getMonth() + 1;
    var year = currentDate.getFullYear();
    var date = day + "/" + month + "/" + year ;
    notificationObj.date = date;
    //console.log("notificationObj",notificationObj);

    var updatequery = {
                    $push: {
                            "notifications": notificationObj
                    }
    };

    project.update(update_record,updatequery,function(err,notif){
            if(err){
                //console.error("error updating",err);
                logger.log('error', err.message);
                var errobj = {

                                  "isError": "true",
                                  "errorCode": "110",                          
                                  "message": err.message

                            };
                res.status(500).json(errobj);
            }else{
                //console.log("resp",notif);
                logger.log('info', 'Updated successfully');
                var obj = {

                                  "isError": "false",                          
                                  "message": "Notification added successfully"

                            };
                if(notif.n > 0){
                    res.status(200).json(obj);
                }else{
                    var errobj = {

                                  "isError": "true",
                                  "errorCode": "111",                          
                                  "message": "No matching record found"

                        };
                    res.status(500).json(errobj);
                }
                
            }
    } );


};