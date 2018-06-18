const requestPromise = require('request-promise-native');
const prompt = require('prompt');

const apiUrl = 'https://api.cloud-elements.com/elements/api-v2'
const startTime = 1529004600000;
const endTime = 1529020800000;

prompt.start();
prompt.get(['Formula Instance ID', 'User Token', 'Organization Token'], function (err, result) {
  const authHeader = `User ${result['User Token']}, Organization ${result['Organization Token']}`
  const formulaInstanceId = `${result['Formula Instance ID']}`;

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
});
