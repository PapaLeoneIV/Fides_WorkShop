import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

//POST
const createUser = async (req, res, UserDB) => {
   const newUser =  await prisma.user.create({
        data:{
            id : UserDB.id,
            name : UserDB.name,
            email: UserDB.email,
            password : UserDB.password
        },
    })
    console.log("Created new user: ", newUser)
    res.send("Created new user: ", newUser)
}
//GET SINGLE
const getUser = async (req, res, id) => {
    const User = await prisma.user.findUnique({
        where: {
            id : id,
          },
    })
    console.log("User retrieved : ", User)
    res.json(newUser)
}
//GET ALL
const getAll = async (req, res) => {
    const Users = await prisma.user.findMany({
    })
    console.log("User retrieved : ", Users)
    res.json(Users)
}
//DELETE
const deleteUser = async (req, res, id) => {
    const response = await prisma.user.delete({
        where : {
            id : id
        }
    })
    console.log("User deleted : ", id)
    res.json(id)
}
//GET USER MONEY
const getUserMoney = async (req, res, id) => {
    const response = await prisma.user.findUnique({
        where:{
            id : id
        }
    })
    console.log("User has : ", id, " money")
    res.json(response.money)
}

export {createUser, getUser, getAll, deleteUser, getUserMoney}