# 认证服务 API 文档

本文档描述了认证服务（Auth Service）提供的所有REST API接口。服务基于NestJS框架开发。

## 基本信息

- 基础URL: `/api`
- 端口: 3001

## 认证相关接口

### 注册用户

- **URL**: `/api/auth/register`
- **方法**: `POST`
- **描述**: 创建新用户账户
- **请求体**:
  ```json
  {
    "username": "用户名",
    "email": "用户邮箱",
    "password": "密码(至少6位)"
  }
  ```
- **参数验证**:
  - `username`: 必填，字符串
  - `email`: 必填，有效的邮箱格式
  - `password`: 必填，字符串，最小长度为6

- **响应**:
  ```json
  {
    "id": "用户ID",
    "username": "用户名",
    "email": "用户邮箱",
    "isAdmin": false,
    "permissionsText": null,
    "lastLogin": null,
    "createdAt": "2023-xx-xxTxx:xx:xx.xxxZ",
    "updatedAt": "2023-xx-xxTxx:xx:xx.xxxZ"
  }
  ```

### 用户登录

- **URL**: `/api/auth/login`
- **方法**: `POST`
- **描述**: 用户登录并获取JWT令牌
- **请求体**:
  ```json
  {
    "username": "用户名",
    "password": "密码"
  }
  ```
- **参数验证**:
  - `username`: 必填，字符串
  - `password`: 必填，字符串

- **响应**:
  ```json
  {
    "user": {
      "id": "用户ID",
      "username": "用户名",
      "email": "用户邮箱",
      "isAdmin": false,
      "permissions": []
    },
    "access_token": "JWT令牌"
  }
  ```

### 获取用户资料

- **URL**: `/api/auth/profile`
- **方法**: `GET`
- **描述**: 获取当前登录用户的资料信息
- **授权**: 需要JWT令牌
- **请求头**:
  ```
  Authorization: Bearer {access_token}
  ```

- **响应**:
  ```json
  {
    "username": "用户名",
    "sub": "用户ID",
    "isAdmin": false,
    "permissions": []
  }
  ```

### 验证令牌

- **URL**: `/api/auth/verify-token`
- **方法**: `GET`
- **描述**: 验证JWT令牌的有效性
- **查询参数**:
  - `token`: JWT令牌

- **响应**:
  ```json
  {
    "isValid": true,
    "userId": "用户ID",
    "username": "用户名"
  }
  ```

  或者当令牌无效时:
  ```json
  {
    "isValid": false
  }
  ```

## 用户相关接口

### 创建用户

- **URL**: `/api/users`
- **方法**: `POST`
- **描述**: 创建新用户（与注册功能相似，但可以由管理员调用）
- **请求体**:
  ```json
  {
    "username": "用户名",
    "email": "用户邮箱",
    "password": "密码(至少6位)"
  }
  ```
- **参数验证**:
  - `username`: 必填，字符串
  - `email`: 必填，有效的邮箱格式
  - `password`: 必填，字符串，最小长度为6

- **响应**: 返回创建的用户对象（密码字段会被排除）

### 获取所有用户

- **URL**: `/api/users`
- **方法**: `GET`
- **描述**: 获取所有用户列表
- **授权**: 需要JWT令牌
- **请求头**:
  ```
  Authorization: Bearer {access_token}
  ```

- **响应**:
  ```json
  [
    {
      "id": "用户ID",
      "username": "用户名",
      "email": "用户邮箱",
      "isAdmin": false,
      "permissionsText": "权限文本",
      "lastLogin": "最后登录时间",
      "createdAt": "创建时间",
      "updatedAt": "更新时间"
    },
    // ... 更多用户
  ]
  ```

### 获取特定用户

- **URL**: `/api/users/:id`
- **方法**: `GET`
- **描述**: 通过ID获取特定用户的信息
- **授权**: 需要JWT令牌
- **请求头**:
  ```
  Authorization: Bearer {access_token}
  ```
- **参数**:
  - `id`: 用户ID，路径参数

- **响应**:
  ```json
  {
    "id": "用户ID",
    "username": "用户名",
    "email": "用户邮箱",
    "isAdmin": false,
    "permissionsText": "权限文本",
    "lastLogin": "最后登录时间",
    "createdAt": "创建时间",
    "updatedAt": "更新时间"
  }
  ```

## 数据模型

### 用户(User)

| 字段           | 类型      | 描述                   |
|--------------|---------|----------------------|
| id           | string  | 用户唯一标识符              |
| username     | string  | 用户名（唯一）              |
| email        | string  | 电子邮箱（唯一）             |
| password     | string  | 密码（已加密，API响应中不会返回）  |
| isAdmin      | boolean | 是否为管理员用户，默认为false    |
| permissions  | string[] | 用户权限列表               |
| lastLogin    | Date    | 最后登录时间               |
| createdAt    | Date    | 创建时间                 |
| updatedAt    | Date    | 最后更新时间               |

## 授权说明

大部分API接口都需要JWT令牌授权。客户端需要在HTTP请求头中添加`Authorization: Bearer {token}`来进行认证。 