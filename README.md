# 생활운동 SNS API Server

Node.js API Server

## Features

- 자바스크립트
- Node.js 런타임
- Express 프레임워크
- REST API

## Folder Structure

```
.
├── common                              # 사용자 정의 함수가 들어있는 폴더
│   ├── index.js                        # async 래핑 함수 외
├── config                              # 설정 파일들이 들어가 있는 폴더
│   ├── response.js                     # API 응답 프레임
│   ├── baseResponseStatus.js           # API 응답 코드 및 메세지
├── node_modules                        # 노드 모듈
├── src
│   ├── app                             # 어플리케이션에 대한 코드 작성
│   │   ├── User                        # User 관련 코드
│   │   │   ├── userRoute.js            # User 라우팅
│   │   │   ├── userController.js       # req, res 처리
│   │   │   ├── userProvider.js         # R에 해당하는 서버 로직 처리
│   │   │   ├── userService.js          # CUD에 해당하는 서버 로직 처리
├── utils
├── .gitignore                          # git 에 포함되지 않아야 하는 폴더, 파일들을 작성 해놓는 곳
├── index.js                            # express 미들웨어 포함
├── package-lock.json
├── package.json                        # 프로그램 이름, 버전, 필요한 모듈 등 노드 프로그램의 정보를 기술
└── README.md
```

---

## API Connection

본 서버는 생활운동 SNS 서비스에서 사용하는 API로써 역할을 함

### Option 1: Connection Test

서버 연결을 위한 API 테스트 가이드

https://www.sosocamp.shop/app/test/connection 으로 POST 요청


> 이 아래부터 미완성
> 
> 
### Option 2: From source

```bash
$ git clone git@github.com:karan/joe.git
$ cd joe/
$ chmod +x tool.sh
$ ./tool.sh build
```

## Usage

### Commands:

```
ls | list       list all available files
u | update      update all available gitignore files
g | generate    generate gitignore files
```

### Basic usage

```bash
$ joe g java    # outputs .gitignore file for java to stdout
```

To update your `.gitignore` files at any time, simply run:

```bash
$ joe u
```

### Overwrite existing `.gitignore` file

```bash
$ joe g java > .gitignore    # saves a new .gitignore file for java
```

### Append to existing `.gitignore` file

```bash
$ joe g java >> .gitignore    # appends to an existing .gitignore file
```

### Multiple languages

```bash
$ joe g java,node,osx > .gitignore    # saves a new .gitignore file for multiple languages
```

### Create and append to a global .gitignore file

You can also use joe to append to a global .gitignore. These can be helpful when you want to ignore files generated by an IDE, OS, or otherwise.

```bash
$ git config --global core.excludesfile ~/.gitignore # Optional if you have not yet created a global .gitignore
$ joe g OSX,SublimeText >> ~/.gitignore
```

### List all available files

```bash
$ joe ls    # OR `joe list`
```

Output:

> actionscript, ada, agda, android, anjuta, appceleratortitanium, archives, archlinuxpackages, autotools, bricxcc, c, c++, cakephp, cfwheels, chefcookbook, clojure, cloud9, cmake, codeigniter, codekit, commonlisp, composer, concrete5, coq, craftcms, cvs, dart, darteditor, delphi, dm, dreamweaver, drupal, eagle, eclipse, eiffelstudio, elisp, elixir, emacs, ensime, episerver, erlang, espresso, expressionengine, extjs, fancy, finale, flexbuilder, forcedotcom, fortran, fuelphp, gcov, gitbook, go, gradle, grails, gwt, haskell, idris, igorpro, ipythonnotebook, java, jboss, jdeveloper, jekyll, jetbrains, joomla, jython, kate, kdevelop4, kohana, labview, laravel, lazarus, leiningen, lemonstand, libreoffice, lilypond, linux, lithium, lua, lyx, magento, matlab, maven, mercurial, mercury, metaprogrammingsystem, meteor, microsoftoffice, modelsim, momentics, monodevelop, nanoc, netbeans, nim, ninja, node, notepadpp, objective-c, ocaml, opa, opencart, oracleforms, osx, packer, perl, phalcon, playframework, plone, prestashop, processing, python, qooxdoo, qt, r, rails, redcar, redis, rhodesrhomobile, ros, ruby, rust, sass, sbt, scala, scons, scrivener, sdcc, seamgen, sketchup, slickedit, stella, sublimetext, sugarcrm, svn, swift, symfony, symphonycms, tags, tex, textmate, textpattern, tortoisegit, turbogears2, typo3, umbraco, unity, vagrant, vim, virtualenv, visualstudio, vvvv, waf, webmethods, windows, wordpress, xcode, xilinxise, xojo, yeoman, yii, zendframework, zephir

### BONUS ROUND: Alternate version control software

Joe isn't **just** a generator for `.gitignore` files. You can use it and its output wherever a SCM is used.

```bash
$ joe g java > .hgignore
```

## Contributing

#### Bug Reports & Feature Requests

Please use the [issue tracker](https://github.com/karan/joe/issues) to report any bugs or file feature requests.

#### Developing

PRs are welcome. To begin developing, do this:

```bash
$ git clone git@github.com:karan/joe.git
$ cd joe/
$ go run *.go
```

#### `tool.sh`

This is a handy script that automates a lot of developing steps.


```bash
USAGE:
    $ $tool [-h|--help] COMMAND

  EXAMPLES:
    $ $tool deps      Install dependencies for joe
    $ $tool build     Build a binary
    $ $tool run       Build and run the binary
```
