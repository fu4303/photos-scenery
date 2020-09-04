import db_ops from './../helpers/db_ops.js';
async function activate_account_email (req,res){
	const token = req.query.token;
    console.log(token)
    if (typeof token == 'string' || token instanceof String) {
        const users = await db_ops.not_activated_user.find_not_activated_user_by_token(token);
        if (users.length === 1) {
            const act_users=await db_ops.activated_user.find_user_by_email(users[0].email)
            db_ops.not_activated_user.delete_not_activated_user_by_token(token) //remove temp account
            if(act_users.length===0){  //if user doesn't exits
                db_ops.activated_user.create_new_user_activated(users[0].email, users[0].password)
                return res.send('<p>Your account is now activated. Visit <a href="http://localhost:3000/login">http://localhost:3000/login</a> to login in.</p>')
            }
        }
    }
    res.send('<p>Activation link is wrong</p>')
}

module.exports = activate_account_email;