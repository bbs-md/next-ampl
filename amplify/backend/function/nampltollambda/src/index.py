import json

def handler(event, context):
  print('received event:')
  print(event)
  args_str = ''
  if 'arguments' in event and event['arguments']:
    args = event['arguments']
    args_str = json.dumps(args)
    print('event.arguments.msg >>>', event['arguments'])
  return {
      'statusCode': 200,
      'headers': {
          'Access-Control-Allow-Headers': '*',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
      },
      'body': json.dumps('Hello from your new Amplify Python lambda!, args: ' + args_str)
  }