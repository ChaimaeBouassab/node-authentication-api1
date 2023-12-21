const express = require('express')
const router = express.Router()
const morgan = require('morgan')
const createError=require('http-errors');


router.post('/register', async (req, res, next) => {
    console.log(req.body);
    try{
        const{email,password} = req.body;
        if(!email || !password){
            throw new Error('Email and password are required');
        }
        return res.status(200).json({ message: 'Registration successful', user: { email } });

    } catch (err) {
     return res.status(500).json({ message: err.message });
    }
}) 
    router.post('/login', async (req, res, next) => {
    res. send('login route')
    })
    
    router.post('/refresh-token', async (req, res, next) => {
        const { email, password } = req.body;

    res.send('refresh token route')
    })
    
    router.post('/register', async (req, res, next) => {
    res. send('register route')
    res.status(200).json({ message: 'Registration successful', user: { email } });

    })

    router.delete('/logout', async (req, res, next) => {
        res. send('logout route')
        })

        module.exports = router