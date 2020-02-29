module.exports = {
  getResearcher: async(req, res) => {

    let { userName } = req.query;
    connection.query(`SELECT * FROM researchers WHERE UserName = "${userName}"`, (error, results) => {
      if(error){
        res.status(400).send(`{"result": "Failure", "error": ${JSON.stringify(error)}}`); 
      }
      else if(!results.length){
        res.status(400).send(`{"result": "Failure", "error": "No users found."}`); 
      }
      else {
        let { UserName, FirstName, LastName, Email } = results[0];
        res.status(200).send(`{"result": "Success", "user": {"userName":  "${UserName}", "firstName": "${FirstName}", 
          "lastName": "${LastName}", "email": "${Email}"}}`);
      }
    });
  },

  addResearcher: async(req, res) => {
  },

  // updateResearcher: async(req, res) => {
  //   let { userName, newPassword, oldPassword } = req.body;
  // },

  // deleteResearcher: async(req, res) => {
  //   let { userName } = req.body;

  //   if(!userName){
  //     res.status(400).send(`{"result": "Failure", "params": {"userName":"${userName}"}, 
  //     "msg": "A Parameter is missing."}`);
  //     return;
  //   }

  //   connection.query(`DELETE FROM researchers WHERE UserName = "${userName}"`, (error, results) => {
  //     if(error){
  //       res.status(400).send(`{"result": "Failure", "error": ${JSON.stringify(error)}}`); 
  //     }
  //     else {
  //       if(results.affectedRows > 0)
  //         res.status(200).send(`{"result": "Success", "msg": "User: ${userName} was deleted."}`);
  //       else res.status(400).send(`{"result": "Failure", "error": "No users found."}`); 
  //     }
  //   });
  // },

  verifyResearcher: async(req, res) => {
    let { userName, password } = req.body;
    if(!userName || !password){
      res.status(400).send(`{"result": "Failure", "params": {"userName":"${userName}","password": "${password}"}, 
      "msg": "A Parameter is missing."}`);
      return;
    }
    connection.query(`SELECT * FROM researchers WHERE UserName = "${userName}"`, (error, results) => {
      if(error){
        res.status(400).send(`{"result": "Failure", "error": ${JSON.stringify(error)}}`); 
      }
      else if(!results.length){
        res.status(400).send(`{"result": "Failure", "error": "No users found."}`); 
      }
      else{
        let hashedPassword = crypto.createHash('md5').update(password).digest('hex');
        if(hashedPassword === results[0].HashedPassword)
          res.status(200).send(`{"result": "Verified"}`);
        else res.status(400).send(`{"result": "wrongPassword"}`);
      }
    });
  }
}