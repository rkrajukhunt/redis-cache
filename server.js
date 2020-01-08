// Import the installed modules.
const express = require('express');
const responseTime = require('response-time')
const redis = require('redis');
const async = require("async");
const app = express();

// create and connect redis client to local instance.
const client = redis.createClient({
    port: 6379,               // replace with your port
    host: 'localhost',  
});

// Print redis errors to the console
client.on('error', (err) => {
  console.log("Error " + err);
});

client.on('connect', () => {
    client.set('jobiak','testing');
});

// use response-time as a middleware
app.use(responseTime());

// create an api/search route
app.get('/api/redis', async (req, res)=> {
   try {
    let jobs = [];
    client.keys('*', async function (err, keys) {
        if (err) return res.json({"error":err});
        if(keys){
            async.map(keys, function(key, cb) {
               client.hgetall(key, function (error, value) {                   
                    var job = {};
                    job['jobId']=key;
                    job['data']=value;
                    cb(null, job);
                }); 
            }, function (error, results) {
               if (error) return res.json({"error":error});
               res.json({data:results});
            });
        }
    });
   } catch (error) {
       res.json({result: "something went to wrong"})
   }
});

app.listen(3000, () => {
  console.log('Server listening on port: ', 3000);
});