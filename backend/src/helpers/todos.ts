import { getTodos, createTodoItem, todoExists, updateTodoItem, deleteTodoItem, updateTodoAttachment } from './todosAcess'
// import { AttachmentUtils } from './attachmentUtils';
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { generatePreUrl } from './attachmentUtils';
import { ItemList } from 'aws-sdk/clients/dynamodb';
// import { createLogger } from '../utils/logger'
// import * as uuid from 'uuid'
// import * as createError from 'http-errors'

const bucketName = process.env.ATTACHMENT_S3_BUCKET


// TODO: Implement businessLogic
export async function getTodosForUser(userId: string): Promise<ItemList> {
  return getTodos(userId);
}

export async function createTodo(userId: string, createTodoRequest: CreateTodoRequest): Promise<TodoItem> {
  return createTodoItem(userId, createTodoRequest)
}

export async function updateTodo(userId: string, todoId: string, updatedTodo: UpdateTodoRequest): Promise<boolean> {
  const isTodoValid = await todoExists(userId, todoId)

  if (!isTodoValid) {
    return false;
  }

  await updateTodoItem(userId, todoId, updatedTodo)
  return true
}

export async function deleteTodo(userId: string, todoId: string): Promise<boolean>  {
  const isTodoValid = await todoExists(userId, todoId)

  if (!isTodoValid) {
    return false
  }

  await deleteTodoItem(userId, todoId)
  return true
}

export async function createAttachmentPresignedUrl(userId: string, todoId: string) {
  const isTodoValid = await todoExists(userId, todoId)

  if (!isTodoValid) {
    return {
      statusCode: 404,
      body: JSON.stringify({
        error: 'Todo does not exist'
      })
    }
  }

  const attachmentUrl = `https://${bucketName}.s3.amazonaws.com/${todoId}`
  await updateTodoAttachment(userId, todoId, attachmentUrl);
  
  return generatePreUrl(todoId)
}

