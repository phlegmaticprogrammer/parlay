import validate from "validate-npm-package-name";

function cvalidate(name : string) {
    console.log(name + ": ");
    console.log(validate(name));
}
cvalidate("some-package")
cvalidate("example.com")
cvalidate("under_score")
cvalidate("123numeric")
cvalidate("@npm/thingy")
cvalidate("@jane/foo.js")
cvalidate("@great.expectations/obua");
cvalidate("@great.expectations/obua/steven");


console.log("COOL!");