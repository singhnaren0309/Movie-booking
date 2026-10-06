Mongoose has a find function, which expects a n js object as the input pararmeter. if object is empty then find function retrun all the data otherwise it return data which satisfy the condition



Model.find(filter,projection,options)

filter 
This can be an empty object or an object which contains the conditions for the data to be fetched. 

For Example: 
1. Model.find({}) -> returns all the data 
2. Model.find({city: "Delhi"}) -> returns all the data which satisfy the condition city=="Delhi" 

3. Model.find({$or: [{city: "Delhi"}, {city: "Mumbai"}]}) -> returns all the data which satisfy the condition city=="Delhi" or city=="Mumbai" 

Projection: 
This can be an empty object or an object which contains the conditions for the data to be fetched. 

For Example: 
1. Model.find({}) -> returns all the data 
2. Model.find({city: "Delhi"}) -> returns all the data which satisfy the condition city=="Delhi" 

3. Model.find({$or: [{city: "Delhi"}, {city: "Mumbai"}]}) -> returns all the data which satisfy the condition city=="Delhi" or city=="Mumbai" 


the key is generalyly th attribut name mof the collection and in the value of the pair we put some custom value to it and then all those doc with that custom value is returned by the find function


options:
this can be an empty object or an object which contains the conditions for the data to be fetched. 

For Example: 
1. Model.find({}) -> returns all the data 
2. Model.find({city: "Delhi"}) -> returns all the data which satisfy the condition city=="Delhi" 

3. Model.find({$or: [{city: "Delhi"}, {city: "Mumbai"}]}) -> returns all the data which satisfy the condition city=="Delhi" or city=="Mumbai" 

we need to add authentication and authorization for the theatre resource

Add authentication in the theatre api
add authorization in the theatre api
admins or clients can create /delete/update theatre,only client can create/delete theatre