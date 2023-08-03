const mongoose = require('mongoose');
mongoose
.connect(process.env.MONGODB_URL,{
    useNewUrlParser: true,
     useCreateIndex: true,
     useUnifiedTopology: true,
      useFindAndModify: true
    });

    // mongodb+srv://taskapp:<password>@cluster0.uhxkv.mongodb.net/test
