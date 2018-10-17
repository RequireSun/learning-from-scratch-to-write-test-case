learning-from-scratch-to-write-test-case
===========

# 初始化项目
```
npm install
```

# 运行测试
```
npm run test
```

# 运行单元测试
```
npm run test:unit
```

单元测试脚本位置:

+ [src/__tests__/example.jest.spec.ts](src/__tests__/example.jest.spec.ts)

    1. jest 各种特性介绍

    1. axios mock
    
+ [src/__tests__/example.default.spec.ts](src/__tests__/example.default.spec.ts)

    基础测试方法 (node 自带的 describe / it / 基础断言使用)

被测代码文件位置:

+ [src/test-target.jest.ts](src/test-target.jest.ts)

    [src/test-target.jest2.ts](src/test-target.jest2.ts)
     
    jest 测试用例的被测 demo

+ [src/test-target.default.ts](src/test-target.default.ts)

    基础测试方法的被测 demo

# Compiles and hot-reloads for development
```
npm run serve
```

# Compiles and minifies for production
```
npm run build
```

# Lints and fixes files
```
npm run lint
```
