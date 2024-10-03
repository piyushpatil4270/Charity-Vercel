const crypto=require("crypto")

function generateToken(data){
    const hash=crypto.createHash("sha256")
    hash.update(data)
    return hash.digest("hex")
}


function compare(data,hash){
    const encrypt=generateToken(data)
    return encrypt===hash
}

const hashed=generateToken("sfbsjnjsn")
console.log(compare("sfbsjnjsns",hashed))

