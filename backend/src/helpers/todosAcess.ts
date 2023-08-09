import * as AWS from 'aws-sdk'
const AWSXRay = require('aws-xray-sdk')
const XAWS = AWSXRay.captureAWS(AWS)
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
// import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
// import { TodoUpdate } from '../models/TodoUpdate';
// import { APIGatewayProxyEvent } from 'aws-lambda'
import * as uuid from 'uuid'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { ItemList } from 'aws-sdk/clients/dynamodb'

// const logger = createLogger('TodosAccess')

const docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient()
const todosTable = process.env.TODOS_TABLE
const todoIdIndex = process.env.TODOS_CREATED_AT_INDEX

// TODO: Implement the dataLayer logic
export async function getTodos(userId: string): Promise<ItemList> {
  
  const result = await docClient.query({
    TableName : todosTable,
    IndexName : todoIdIndex,
    KeyConditionExpression: 'userId = :userId',
    ExpressionAttributeValues: {
        ':userId': userId
    }
  }).promise()

  return result.Items
}

export async function createTodoItem(userId: string, createTodoRequest: CreateTodoRequest): Promise<TodoItem> {
    const todoId = uuid.v4();
    const newItem = {
      todoId,
      name: createTodoRequest.name,
      dueDate: createTodoRequest.dueDate,
      done: createTodoRequest.done || false,
      createdAt: createTodoRequest.createdAt || new Date().toString(),
      userId
    }
    console.log('Storing new item: ', newItem)

    await docClient
      .put({
        TableName: todosTable,
        Item: newItem
      })
      .promise()
    
    return newItem as TodoItem
}

export async function updateTodoItem(userId: string, todoId: string, updatedTodo: UpdateTodoRequest): Promise<void> {
  console.log('Updating todo', todoId, 'update value', updatedTodo)
  const params = {
    TableName: todosTable,
    Key: {
        "todoId": todoId,
        "userId": userId
    },
    UpdateExpression: 'set #name = :name, dueDate = :dueDate, done = :done',
    ExpressionAttributeNames: {
      "#name": "name"
    },
    ExpressionAttributeValues: {
      ":name": updatedTodo.name,
      ":dueDate": updatedTodo.dueDate,
      ":done": updatedTodo.done
    }
  };

  await docClient.update(params, function(err, data) {
      if (err) console.log(err);
      else console.log(data);
  });
  console.log('Updated todo', todoId, 'update value', updatedTodo)
}

export async function updateTodoAttachment(userId: string, todoId: string, attachmentUrl: string): Promise<void> {
  console.log('Updating todo', todoId, 'attachmentUrl', attachmentUrl)
    const params = {
      TableName: todosTable,
      Key: {
          "todoId": todoId,
          "userId": userId
      },
      UpdateExpression: 'set attachmentUrl = :attachmentUrl',
      ExpressionAttributeValues: {
        ":attachmentUrl": attachmentUrl,
      }
    };

  await docClient.update(params, function(err, data) {
      if (err) console.log(err);
      else console.log(data);
  });
  console.log('Updating todo', todoId, 'attachmentUrl', attachmentUrl)
}

export async function deleteTodoItem(userId: string, todoId: string): Promise<void> {
  const deleteParams = {
    TableName: todosTable,
    Key: {
      "todoId": todoId,
      "userId": userId
    },
   };
 
   await docClient.delete(deleteParams).promise();
}

export async function todoExists(userId: string, todoId: string) {
  const result = await docClient
    .get({
      TableName: todosTable,
      Key: {
        "todoId": todoId,
        "userId": userId
      }
    })
    .promise()

  console.log('todoId', todoId, 'userId', userId)
  console.log('Get todo: ', result.Item)
  return !!result.Item
}