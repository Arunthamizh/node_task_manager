const express = require('express');
const Task = require('../models/task');
const auth = require('../middleware/auth');
const router = express.Router();
// const { ObjectID } = require('mongodb');
// task endpoint 
router.post('/tasks', auth, async (req, res) => {
    // constructor function for task
    // const task = new Task(req.body);
    // task.save().then(()=>{
    //     res.status(201).send(task)
    // }).catch((e)=>{
    //     res.status(400).send(e);
    // })
    // const task = new Task(req.body)

    const task = new Task({
        ...req.body,
        owner: req.user._id
    });

    try {
        await task.save()
        res.status(201).send(task)
    } catch (e) {
        res.status(400).send(e)
    }
})


// GET /task?completed=true
// GET /tasks?limit=10&skip=10
// GET /tasks?sortBy=createdAt:dec 
router.get('/tasks', auth, async (req, res) => {
    debugger
    // Task.find({}).then((data)=>{
    //     if(!data){
    //         res.send('No record')
    //     }
    //     res.send(data);
    // }).catch((e)=>{
    //     res.send(e)
    // })

    const match = {}
    const sort = {}
    debugger
    if (req.query.completed) {
        match.completed = req.query.completed === 'true'
    }

    if (req.query.sortBy) {
        const parts = req.query.sortBy.split(':');
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
    }
    try {
        // const task = await Task.find({owner: req.user._id}) 
        // (or)
        await req.user.populate({
            path: 'tasks',
            match,
            options: {
                // limit: 1
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            },
        }).execPopulate()
        res.send(req.user.tasks)

        // const task = await Task.find({owner:req.user._id})
        // if (!task) return res.status(404).send()
        // res.send(task);
    } catch (error) {
        res.status(500).send(error)
    }
});

router.get('/tasks/:id', auth, async (req, res) => {
    const _id = req.params.id

    // Task.findById(_id).then((data)=>{
    //     if(!data){
    //         res.status(400).send()   
    //     }
    //     res.send(data)
    // }).catch((e)=>{
    //     res.status(500).send(e);
    // })
    debugger
    try {
        // const task = await Task.findById(_id)
        const task = await Task.findOne({ _id, owner: req.user._id })
        // const task = await Task.findOne({_id, owner: req.user._id})
        if (!task) return res.status(400).send()

        // Create big problem it tacks 3 to 4 hours to fix the above populat is not work is uncomment the below console
        // console.log(task,"dadasdasdasdasdasd")

        res.send(task)
    } catch (error) {
        res.send(error)
    }
});


router.patch('/tasks/:id', auth, async (req, res) => {
    debugger
    // Get the object Keys
    const updates = Object.keys(req.body);
    const allowedUpdates = ['description', 'completed'];
    const validUpdateTask = updates.every((update) => allowedUpdates.includes(update))
    if (!validUpdateTask) {
        return res.status(404).send('error: Invalid updates')
    }
    try {
        // const task = await Task.find({_id: req.params.id, owner:req.user._id})

        const task = await Task.findOne({ _id: req.params.id, owner: req.user._id })
        if (!task) {
            return res.status(404).send()
        }
        updates.forEach((update) => {
            task[update] = req.body[update]
        })
        await task.save()
        // const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })

        res.send(task)
    } catch (error) {
        res.status(400).send(error)
    }
});


router.delete('/tasks/:id', auth, async (req, res) => {
    console.log('task try')
    try {
        // console.log('task try')
        const task = await Task.findOneAndDelete({ _id: req.params.id, owner: req.user._id })
        if (!task) return res.status(404).send('error: record to delete')
        res.send(task);
    } catch (error) {
        res.status(500).send(error)
    }
});

module.exports = router