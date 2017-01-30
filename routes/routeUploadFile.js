var util = require('../public/util'),
    fs = require('fs'),
    logger = require("../public/logger"),
    config = require('../public/config');

exports.uploadFile = function uploadFile(req, res, next) {
    
    var parentFolderId = req.params.folderId;
	var sdk = util.getBOXAPIClient(true, config.ADMIN_ID);
	var subFolder_ID;
	
	var onGettingResults = function(err,result){
		
		var entries = (result.entries && result.entries.length) ? result.entries : [];
		
		console.log('Finalresult' + JSON.stringify(result));
		for(var i=0; i < entries.length; i++){
			if(entries[i].name == "Mic"){
				subFolder_ID = entries[i].id;
			}
		}
		console.log('subFolder_ID' + subFolder_ID);
		onCallingNewFunction(subFolder_ID);
	};

	sdk.folders.getItems(parentFolderId,{
			fields: 'name,modified_at,size',
			offset: 0,
			limit: 25,
			name: 'Mic'
		},onGettingResults);
		
	var onCallingNewFunction =  function(subFolder_ID){
		var data = new Buffer('');
		req.on('data', function (chunk) {
			data = Buffer.concat([data, chunk]);
		});
		req.on('end', function () {
			req.rawBody = data;
			//var fileStream = fs.createReadStream(data);
			var filename = req.query.filename;
			// Get a read stream to the file that the user uploaded
			//var fileStream = fs.createReadStream(req.body.file.path);
			// Make an API call to upload the user's file to Box
			
			
			


			sdk.files.uploadFile(subFolder_ID, filename, req.rawBody, function (err, data) {
				if (err) {
					logger.log('error', 'file upload is failed:' + err);
					res.status(400).json(util.showMessage('error:' + err.message));
				}
				else {
					//Once the upload completes, delete the temporary file from disk
					//fs.unlink(req.body.file.path, function () { });
					logger.log('info', 'file is uploaded: The details are:' + JSON.stringify(data));
					var resp = {
						"box_file_id": data.entries[0].id,
						"file_name": data.entries[0].name
					};
					res.status(200).json(resp);
				}
			});
			//-------------------
		});
	}
}

