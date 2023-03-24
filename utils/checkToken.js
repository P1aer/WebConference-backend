import jwt from "jsonwebtoken"

function checkToken(req,res,next) {
    const token = (req.headers.authorization || "").replace(/Bearer\s?/,"")
    if (token) {
        try {
            const decode = jwt.verify(token,process.env.JWT_KEY)
            req.userId = decode._id
            next()
        }
        catch (err) {
            return res.status(403).json({
                message: "Вы не авторизованы"
            })
        }
    }
    else {
        return res.status(403).json({
            message: "Вы не авторизованы"
        })
    }

}

export default checkToken