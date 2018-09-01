**aws-lambda-deployer** is library that archive your local source code to zip and deploy to AWS Lambda Function.

# Requirement
You need to install these tools.

- [Python](https://www.python.org/downloads/)(Python2.6.5+ or Python3.3+)
- [pip](https://pypi.org/project/pip/)
- [aws-cli](https://docs.aws.amazon.com/ja_jp/streams/latest/dev/kinesis-tutorial-cli-installation.html)

## Install and Setup aws-cli
Install 'aws-cli' with `pip`.

```
$ pip install awscli --upgrade --user
```

After you install, you need to set AWS Credentials in aws-cli. Please execute `aws configure`.

```
$ aws configure
AWS Access Key ID [None]: AKIAIOSFODNN7EXAMPLE
AWS Secret Access Key [None]: wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
Default region name [None]: us-west-2
Default output format [None]: json
```

## Created Lambda function
You need to finish create Lambda function before deploy.

# Use aws-lambda-local-deployer
## install
Please install with `npm install`.

```
$ npm install --save-dev aws-lambda-local-deployer
```

## Create JSON parameter file
You need JSON parameter file to use this library. You can create parameter file with `aldeploy --init`.

```
$ aldeploy --init
```

`$NODE_HOME/.aldeploy.json` is created. You can set these parameters in this file.

- `rootdir`(string) : Target archive directory root. Default `.`($NODE_HOME).
- `zipname`(string) : Archive zip file name. Default `lambda.zip`.
- `deletezip`(boolean) : If true, archive zip file is deleted. Default `true`.
- `exclude`(Array(string)) : If filename match this pattern, it is'nt contained archive file. you can write in glob format.
- `region`(string,option) : Target deployed AWS Region. If you use command line option, this parameter is ignored.
- `funcname`(string,option): Target deployed AWS Lambda Function name. If you use command line option, this parameter is ignored.

## Deploy
Now you can deploy with `aldeploy deploy`.

```
$ aldeploy deploy
```

Also you can give parameters `--region` and `--funcname`.These are prioritized, if although you set parameter file.

```
$ aldeploy deploy --region ap-northe-east2 --funcname MyLambdaFunction
```
