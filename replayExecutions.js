//this script is used to replay executions in bulk for each formula instance
//note that executions are only kepts for three days
//npm install request-promise-native and prompt
//command line will prompt you for Formula Instance ID, User Token, and Organization Token
//startTime and endTime are hard coded epoch timestamps used to limit the query

const requestPromise = require('request-promise-native');
const prompt = require('prompt');

const apiUrl = 'https://api.cloud-elements.com/elements/api-v2'
//const startTime = 1529004600000;
//const endTime = 1529020800000;
console.log("Please provide the following information to replay past executions:");

prompt.start();
prompt.get(['Environment (staging or production?)','Formula Instance ID', 'User Token', 'Organization Token', 'Start Time UTC(i.e. 2018/01/01 00:00:00)', 'End Time UTC(i.e. 2018/01/01 00:00:00)'], function (err, result) {
  // const authHeader = `User ${result['User Token']}, Organization ${result['Organization Token']}`
  // const formulaInstanceId = `${result['Formula Instance ID']}`;
  const authHeader = `User a/71yZpaoDHME6mCtSL50EVPRAsiunYcteMe1kbo9lo=, Organization UbK7Os/tsG7Q5XCj2hf8hJi6S1fOuy2WZuMR6IEjFyU=`
  const formulaInstanceId = `238739`;
  const startTime = Date.parse(result['Start Time (i.e. 2018/01/01 00:00:00)']);
  const endTime = Date.parse(result['End Time (i.e. 2018/01/01 00:00:00)']);

  console.log(`Replaying executions from: ${new Date(startTime)} to ${new Date(endTime)}`);
  console.log(`Using Authorization Header: ${authHeader}`);
  console.log(`Formula Instance ID: ${formulaInstanceId}`);

  const getExecutions = function(){
    const options =  {
      'method': 'GET',
      'headers': {
        'Authorization': authHeader
      },
      'json': true,
      'url': `${apiUrl}/formulas/instances/${formulaInstanceId}/executions?objectId=&nextPage=`
    };

    return requestPromise(options);
  }

  const replayExecution = function(id){
    const options =  {
      'method': 'PUT',
      'headers': {
        'Authorization': authHeader
      },
      'json': true,
      'url': `${apiUrl}/formulas/instances/executions/${id}/retries`
    };

    requestPromise(options)
    .then(function (response) {
      console.log(`Successfully replayed execution: ${JSON.stringify(response)}`);
    })
    .catch(function (err) {
      console.log(`Error replaying execution: ${err}`)
    });
  }

  if(!isNaN(startTime) && !isNaN(endTime) && startTime < endTime){
    getExecutions().then(function (response) {
        console.log("Successfully retrieved executions");
        return response.filter((execution) => {
          const executionTime = new Date(execution.createdDate).getTime();
          return execution.status === 'failed' && executionTime > startTime && executionTime < endTime;
        }).forEach((execution) => {
          replayExecution(execution.id);
        });
      })
      .catch(function (err) {
        console.log(`Error fetching executions: ${err}`)
      })
  } else if(isNaN(startTime) || isNaN(endTime)){
    console.log("Please enter a valid date format");
  } else if(startTime >= endTime){
    console.log("")
  }

});
