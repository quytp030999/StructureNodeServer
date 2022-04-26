var app = require("./app");

var PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`server is running with PORT::: ${PORT}`);
});
