const { Configuration, OpenAIApi } = require("openai");
const env = require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const app = express();
const PORT = process.env.PORT || 5000;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


app.use(
    cors({
        origin: ["http://localhost:5000"],
        methods: "GET,POST,PUT,DELETE,OPTIONS",
    })
);

//! DAVINCI

app.get("/hello",(req,res)=>{
  return res.send("kiya haal hai")
})

//! TURBO
app.post("/api/rewrite", async (req, res) => {
  let data = req.body
  
  // Extract the relevant data from the array
  const passages = data.filter(obj => obj.Article).map(obj => obj.Article);  
  const words = data.filter(obj => obj.title).map(obj => {
    const [word, minOccur, maxOccur] = obj.title.split(',');
    return `Word: ${word} - Maximum occurence: ${maxOccur} - Minimum occurence: ${minOccur}`;

    


  });
  
  
 
  const prompt = `Your task is to generate a revised version of a given passage of text while maintaining two criteria: (1) words from a list with their corresponding minimum and maximum ranges must be constrained to those ranges, and (2) the revised version must maintain the same meaning and accuracy as the original text.

  Please note that you should not add any words to the original text. Your task is solely to adjust existing words to meet the range constraints while preserving the original meaning and accuracy.
  
  For example, if the word "happy" is in the list with a minimum range of 3 and a maximum range of 7, and the original passage contains the word "happy", you should ensure that the word stays within the 3-7 range in the revised version without adding any additional words.
  
  If keeping a word within its range would significantly change the meaning or accuracy of the passage, you should prioritize accuracy over staying within the range. The goal is to produce a revised version of the passage that maintains a balance between staying within the range constraints and preserving the original meaning and accuracy.` + "\nPassage: \n" +  passages.join('\n\n') + '\n\nWords list: \n' + words.join('\n');
  
  // console.log(prompt);
  
  
  const openAi = new OpenAIApi(
    new Configuration({
      apiKey: process.env.OPENAI_API_KEY,
    })
  )


  try{
    const response = await openAi.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [{ role: "system", content: prompt }],
    })

    const generatedDescription = response.data.choices[0].message.content
    console.log(generatedDescription)

    
    res.send(generatedDescription)
  } catch(e){
    console.log(e)
  }
});






app.listen(PORT, function () {
    console.log(`Server Runs Perfectly at http://localhost:${PORT}`);
});