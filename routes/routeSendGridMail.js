var util = require('../public/util')
logger = require("../public/logger"),
    config = require('../public/config'),
    sendgrid = require('sendgrid')(config.MAIL.SEND_GRID_APIKEY),
    async = require('async'),
    request = require('request');

exports.sendMail = function sendMail(req, res, next) {
    NotifyTeams(req,res);
}

function NotifyTeams(req, res) {
    var fullUrl = req.protocol + '://' + req.get('host') + '/pw/v1/customers/' + req.params.customerId + '/projects/' + req.params.projectId;
    request(fullUrl, function (err, response, body) {
        if (err) {
            res.status(500).json(util.showMessage(err.message));
            //next(err,null);
        }
        else {
            //next(null,body);
            var resp = JSON.parse(body);
            sendMail(resp, function (err, result) {
                if (err) {
                    res.status(500).json(util.showMessage(err.message));
                } else {
                    res.status(200).json(util.showMessage('sent mail sucessfully!'));
                }
            });
            
        }
    })

};

function sendMail(req,callback)
{
    var projectTeam = req.project_team ? req.project_team : [];
    var customerTeam = req.customer_team ? req.customer_team : [];
    
    var combinedUsers = projectTeam.concat(customerTeam);

    var TO_EMAIL = [], emailID = "";
    for (var i = 0; i < combinedUsers.length; i++) {
        //console.log("insideFirstObj:" + JSON.stringify(projectTeam[i]));
        logger.log('info', "insideFirstObj:" + JSON.stringify(combinedUsers[i]));
        //emailID = combinedUsers[i].email_address;
        TO_EMAIL.push(combinedUsers[i].email_address);
    }
    //for (var j = 0; j < customerTeam.length; j++) {
    //    emailID = customerTeam[j].email_address;
    //    TO_EMAIL.push(emailID);
    //}

    var EMAIL_TO = TO_EMAIL.filter(function (elem, pos) {
        return TO_EMAIL.indexOf(elem) == pos;
    });
    var helper = sendgrid.mail,
        from_email = new helper.Email(config.MAIL.SENDER), //add SENDGRID_SENDER
        to_email = new helper.Email(EMAIL_TO),
        subject = 'Welcome to PW team!';//req.body.subject,
        content = new helper.Content('text/plain', 'Welcome to project-'+ (req.project_detail.project_name||'')),
        mail = new helper.Mail(from_email, subject, to_email, content),
        personalization = new helper.Personalization();
    for (var i = 0; i < EMAIL_TO.length; i++) {
        var email = new helper.Email(EMAIL_TO[i]);
        personalization.addTo(email);
    }
    mail.personalizations[0] = personalization;
    //var sg = //require('sendgrid')('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');
    var requestMail = sendgrid.emptyRequest({
        method: 'POST',
        path: '/v3/mail/send',
        body: mail
    });
    
    sendgrid.API(requestMail, function (err, response) {
        if (err) {
            //res.status(400).json(err);
            callback(err,null);
        } else {
            callback(null, response);
            //res.status(200).json(util.showMessage('success'));
        }
    });
}




