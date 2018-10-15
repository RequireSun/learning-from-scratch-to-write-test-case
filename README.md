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

+ [src/__tests__/example.junior.spec.ts](src/__tests__/example.junior.spec.ts)
    
    基础测试方法 (describe / it / 基础断言使用)

+ [src/__tests__/example.senior.spec.ts](src/__tests__/example.senior.spec.ts)

    1. axios mock
    
    1. vue 组件测试

被测代码文件位置:

+ [src/example-for-test.ts](src/example-for-test.ts)

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
