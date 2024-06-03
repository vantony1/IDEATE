const fs = require('fs');
const cors = require('cors');
const express = require('express')

var bodyParser = require('body-parser')
const logger = express()
const port = 5005

logger.use(cors())

var jsonParser = bodyParser.json()


logger.post('/appendLog', jsonParser, (req, res) => {
  console.log('Received request to append log: %s', String(req.body["log"]));

  const logFileName = String(req.body["logFileName"]);
  const log = String(req.body["log"]);

  fs.appendFile("../assets/logs/"+logFileName, log, (err) => {
      if (err) {
          console.error('Error writing log:', err);
          return res.status(500).send('Error writing log');
      }

      console.log('Log appended to file:', logFileName);
      return res.send('Log appended successfully');
  });
});


logger.listen(port, () => {
  console.log(`logger listening on port ${port}`)
})
