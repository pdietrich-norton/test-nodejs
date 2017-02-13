# Norton Node Rest API
 
### (Similar to Laravel Auth Server functionality)

##Installation
Create database "nodeauth" on local MongoDb installation. This server will use localhost:27017 unless the connect string in server.js is modified.

```
npm install
```


##Run Server
Navigate to install directory then

 ```
 node server
 ```

##Services Available
* Create new user
* Create new client (a client is associated with a user in the database so you must create a user for the client)
* Issue token for a given user & client
* Revoke previously issued token
* Get user_id and email given a valid token

##Make Requests
Use **Postman** to make requests.


####1. Create new User (POST)
urlencoded post vars: 

* username 
* password 
* firstname
* lastname

```
URL: http://localhost:3000/api/user/add
```

####2. Create new Client (POST) 
urlencoded post vars:

* name - the name of your app/s to be associated with this client
* userId -  is the MongoId of the user created for this client
* clientAllowed - is a secret string to ensure this route is only accessible by an authorized user (value "clientauthstring")

```
URL: http://localhost:3000/api/client/add
```

####3. Request an Authentication Token for a given user & client (POST) 
urlencoded post vars:

* grant_type (value "password")
* username - user's username/email
* password - user's password

Basic Authorization header with Client Id (username field) and Client Secret (password field) 

* clientId - Client Id created by Client-add route above
* clientSecret - Client Secret created by Client-add route above

```
URL: http://localhost:3000/api/token
```

####4. Request a Refresh token for an Authenticated Token (POST)
urlencoded post vars:

* grant_type (value "refresh_token")
* refresh_token - value of refresh_token returned in the token auth request above

Basic Authorization header with Client Id (username field) and Client Secret (password field) 

* clientId - Client Id created by Client-add route above
* clientSecret - Client secret created by Client-add route above

```
URL: http://localhost:3000/api/token
```

####5. Revoke an Authenticated Token (POST)
Bearer Authorization header (value "Bearer [token-to-be-revoked]")

* clientId - Client Id created by Client-add route above
* clientSecret - Client secret created by Client-add route above

```
URL: http://localhost:3000/api/revoke
```

####6. Validate a user is still authenticated or retrieve username/email of user (GET)

This service will return the userId and email of the user associated with the token

Bearer Authorization header (value "Bearer [access-token]")

Send these as headers (not as basic auth)

* clientId - Client Id created by Client-add route above
* clientSecret - Client secret created by Client-add route above

```
URL: http://localhost:3000/api/user
```