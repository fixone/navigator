"use strict";
const {google} = require("googleapis");

const nconf = require('nconf');
nconf.argv().env();
const docId =  nconf.get("docId")||nconf.get("DOC_ID");
console.log("working with docId",docId);
const sheetsVersion = "v4";

const reqURL = "https://sheets.googleapis.com/"+sheetsVersion+"/spreadsheets/"+docId;

const getEntries = async (sheetName) => {
    const gauth = await google.auth.getClient({
        scopes: [
        "https://www.googleapis.com/auth/spreadsheets",
        "https://www.googleapis.com/auth/devstorage.read_only"
        ]
    });
    try {
        const rsp = await gauth.request({
            url:reqURL+"/values/"+sheetName+"!A:B",
            majorDimension:"COLUMNS"
            
        });
        if(rsp!=null && rsp.data != null && rsp.data.values != null) {
            return rsp.data.values;
        } else {
            console.log("getEntries:no values returned");
            return null;
        }
    }catch(err) {
        console.log("getEntries:Caught error",err);
        return null;
    }
}

exports.getLink = async (req,res) => {
    const gauth = await google.auth.getClient({
        scopes: [
            "https://www.googleapis.com/auth/spreadsheets",
            "https://www.googleapis.com/auth/devstorage.read_only"
        ]
    });
    let sName = nconf.get("sheetName") || nconf.get("SHEET_NAME");

    let entries = await getEntries(sName);

    let defURL = nconf.get("DEFAULT_URL")||"https://www.wikipedia.org";

    if(entries != null) {
        console.log("iterating",entries);
        if(Array.isArray(entries)) {
            for(let i=0;i<entries.length;i++) {
                if(entries[i]=!null && entries[i][0]==req.url)
                    console.log("redirecting to",entries[i][1]);
                    res.redirect(302,entries[i][1]);
                    return;
            }

        }

    } else {
        console.log("no entries, redirecting to default url");
    }
    res.redirect(302,defURL);

}



