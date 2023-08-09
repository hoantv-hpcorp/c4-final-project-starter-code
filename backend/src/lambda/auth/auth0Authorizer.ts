import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

import { verify } from 'jsonwebtoken'
import { createLogger } from '../../utils/logger'
// import Axios from 'axios'
// import { Jwt } from '../../auth/Jwt'
import { JwtPayload } from '../../auth/JwtPayload'

const logger = createLogger('auth')

// TODO: Provide a URL that can be used to download a certificate that can be used
// to verify JWT token signature.
// To get this URL you need to go to an Auth0 page -> Show Advanced Settings -> Endpoints -> JSON Web Key Set
// const jwksUrl = '...'
const cert = `-----BEGIN CERTIFICATE-----
MIIDHTCCAgWgAwIBAgIJHaF3XL9jhH5iMA0GCSqGSIb3DQEBCwUAMCwxKjAoBgNV
BAMTIWRldi1pNmhjdDJycHk4cWcza25mLnVzLmF1dGgwLmNvbTAeFw0yMzA3MDUw
NzE0NDRaFw0zNzAzMTMwNzE0NDRaMCwxKjAoBgNVBAMTIWRldi1pNmhjdDJycHk4
cWcza25mLnVzLmF1dGgwLmNvbTCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoC
ggEBAKtqA7aGAD+00LhUqENfkzm28heAw7O2an/eH0cNId/taXaZ1avnZvxRpeBQ
JhMzLAlSpfbhUUg0LGEi+nIZ1pgAs48AxWIFxgIVfgYM+MlzhmJlZry8MTf6b1ym
7rAH+g0qLBet5npCuzEvWY+M9InOSkxVeTlBeX77I9phLK//TLpK4yABSQM/jQVb
EJEJI3ckCyZ5t/05ENdKf5o2aIWhNpEY/tV0f+HWRiwVb4syPPbKZm4UUL5pRupI
Q92aDDIF3bXgdLIB4OmjwQPs0q1p8LnER8l+ZxaI1wqJSfdpoU433f9K0wsFxPY/
pJ5YRYKDmwlBahcEP/B9wjcISDMCAwEAAaNCMEAwDwYDVR0TAQH/BAUwAwEB/zAd
BgNVHQ4EFgQUuLrYWeJ0mi6Z3zqc6KrQtE38AkcwDgYDVR0PAQH/BAQDAgKEMA0G
CSqGSIb3DQEBCwUAA4IBAQCTz4kqu1xfuUL6ny9BjR4FNkxLIyBHb/W4KALT2qWA
mjEPEVQbD8OEdt7GAcBlVaARLsE1qBRci8RQ1vKOniYLElwyfnok/VYaP1mCnQio
6JhEMb4ict7RIEY6CjLv4pjHrKwONEPVjhZ4Z24gHZydxcgI36sH5s1CIZkpYtaC
zPXHw9ZmKIgYdIxOubwom738r7HHSLO0J1xPJ4l/Yh8p4IXfRH3eSEOqd6KMEdv0
ntLc5vAwOW4EPWbPelMq/L6ne0enYT+eWtQyIthGjn8EjheGvJ0Y/3fbzy2snp73
auNskORX2DxB/7ObmvCMuo27GuZ1carCvvnOjf0/Whyo
-----END CERTIFICATE-----`

export const handler = async (
  event: CustomAuthorizerEvent
): Promise<CustomAuthorizerResult> => {
  logger.info('Authorizing a user', event.authorizationToken)
  try {
    const jwtToken = await verifyToken(event.authorizationToken)
    logger.info('User was authorized', jwtToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

async function verifyToken(authHeader: string): Promise<JwtPayload> {
  const token = getToken(authHeader)
  // const jwt: Jwt = decode(token, { complete: true }) as Jwt

  // TODO: Implement token verification
  // You should implement it similarly to how it was implemented for the exercise for the lesson 5
  // You can read more about how to do this here: https://auth0.com/blog/navigating-rs256-and-jwks/
  
  return verify(token, cert, { algorithms: ['RS256'] }) as JwtPayload
}

function getToken(authHeader: string): string {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}
