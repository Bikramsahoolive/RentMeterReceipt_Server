
# rentNmeter.receipt Server-side

This repository contains the server-side programming for the rentNmeter.receipt web application, specifically catering to landlord-related functionalities.

## Endpoints

### Create Admin User

- **Method**: GET
- **Endpoint**: /admin
- **Description**: Automatic create admin user once if not created or deleted.

### Reset Admin User Data

- **Method**: POST
- **Endpoint**: /admin/reset
- **Description**: Reset admin user data, reset_key required.

### Update Admin User Data

- **Method**: PUT
- **Endpoint**: /admin
- **Description**: Update admin user data, admin login required.

### Login Admin User

- **Method**: POST
- **Endpoint**: /admin/login
- **Description**: Authenticate and login a admin user with phone and password and set {isActive} state.

### Signup request for New Landlord User

- **Method**: POST
- **Endpoint**: /signup
- **Description**: Signup request for a new landlord user creation and generate registration id.

### Signup request Status for New Landlord User

- **Method**: GET
- **Endpoint**: /signup/status/:registrationId
- **Description**: Check signup request status for a new landlord user creation.

### Approve New Landlord User

- **Method**: POST
- **Endpoint**: /landlord/action/:registrationId
- **Description**: Approve a new landlord user and generate landlord id, admin login required.

### Get All Landlord User Data

- **Method**: GET
- **Endpoint**: /landlord
- **Description**: Get all data of landlord users, admin login required.

### Get Single Landlord User Data

- **Method**: GET
- **Endpoint**: /landlord/user/:id
- **Description**: Get single data of a landlord user based on the provided ID, admin/landlord login required.

### Update Landlord User Data

- **Method**: PUT
- **Endpoint**: /landlord/user/:id
- **Description**: Update data of a specific landlord user, admin/landlord login required.

### Delete Landlord User Data

- **Method**: DELETE
- **Endpoint**: /landlord/user/:id
- **Description**: Delete data of a specific landlord user admin/landlord login required.

### Login Landlord User

- **Method**: POST
- **Endpoint**: /landlord/login
- **Description**: Authenticate and login a landlord user with phone and password and set {isActive} state.

###  Create New Rent-Holder User

- **Method**: POST
- **Endpoint**: /rent-holder
- **Description**: Create a new rent holder user, landlord login required.

###  Get all Rent-Holder User

- **Method**: GET
- **Endpoint**: /rent-holder
- **Description**: Get all data of  rent-holder users, admin login required.

###  Get Single Rent-Holder User Data

- **Method**: GET
- **Endpoint**: /rent-holder/user/:id
- **Description**: Get data of a single rent-holder user based on the provided ID, login required.

###  Get all Rent-Holder User of specific landlord user.

- **Method**: GET
- **Endpoint**: /rent-holder/landlord
- **Description**: Get all data  of  rent-holder user based on the landlord login.

###  Update Rent-Holder User Data.

- **Method**: PUT
- **Endpoint**: /rent-holder/user/:id
- **Description**: Update data for a specific rent-holder user,  login required.

### Delete Rent-Holder User Data

- **Method**: DELETE
- **Endpoint**: /rent-holder/user/:id
- **Description**: Delete data for a specific rent-holder user and all related rent-bill data, landlord login required.

### Login Rent-Holder User

- **Method**: POST
- **Endpoint**: /rent-holder/login
- **Description**: Authenticate and login a rent-holder user with phone and password and set {isActive} state.

### Check Session of Logged in User

- **Method**: POST
- **Endpoint**: /check-session
- **Description**: Check the session status of user and send json data + {isActive,message}.

### Logout User

- **Method**: POST
- **Endpoint**: /logout
- **Description**: Logout all user and send json data {isActive,message} if logged in.

### Main-Meter Bill Create

- **Method**: POST
- **Endpoint**: /mainMeter
- **Description**: Create a new main-meter bill and get the bill number, landlord login required.

### Get All Main-Meter Bill 

- **Method**: GET
- **Endpoint**: /mainMeter
- **Description**: Get all main-meter bill, admin login required.

### Get All Main-Meter Bill of Spesific Landlord

- **Method**: GET
- **Endpoint**: /mainMeter/landlord
- **Description**: Get all main-meter bill creater by landlord, landlord login required.

### Get Single Main-Meter Bill

- **Method**: GET
- **Endpoint**: /mainMeter/bill/:id
- **Description**: Get single main-meter bill, landlord login required.

### Update Single Main-Meter Bill

- **Method**: PUT
- **Endpoint**: /mainMeter/bill/:id
- **Description**: Update single main-meter bill, landlord login required.

### Delete Single Main-Meter Bill

- **Method**: DELETE
- **Endpoint**: /mainMeter/bill/:id
- **Description**: Delete single main-meter bill, landlord login required.

### Rent-Bill Create

- **Method**: POST
- **Endpoint**: /rent-bill
- **Description**: Create a new rent-bill and get the bill number, landlord login required.

### Get All Rent-Bill 

- **Method**: GET
- **Endpoint**: /rent-bill
- **Description**: Get all rent-bill, admin login required.

### Get All Rent-Bill of Spesific Landlord

- **Method**: GET
- **Endpoint**: /rent-bill/landlord
- **Description**: Get all rent-bill creater by landlord, landlord login required.

### Get Single Rent-Bill

- **Method**: GET
- **Endpoint**: /rent-bill/bill/:id
- **Description**: Get single rent-bill, login required.

### Update Single Rent-Bill

- **Method**: PUT
- **Endpoint**: /rent-bill/bill/:id
- **Description**: Update single rent-bill, landlord login required.

### Delete Single Rent-Bill

- **Method**: DELETE
- **Endpoint**: /rent-bill/bill/:id
- **Description**: Delete single rent-bill, landlord login required.

## Usage

Ensure you have the necessary environment and dependencies set up before using the server-side application.

### Prerequisites

node environment support and node package manager.

### Installation

node js v- 18.16.0 , npm v- 9.5.1 . run npm install to download all dependencies.

## Contributing

If you would like to contribute to the development of this server-side application, follow the guidelines below.

### Development Setup

Ensure you have a local development environment set up before making contributions.

### How to Contribute

1. Fork the repository.
2. Create a new branch for your feature or bug fix.
3. Make your changes and commit them with descriptive messages.
4. Submit a pull request.

## License

Specify the license under which the server-side application is released.

## Contact

For any questions or concerns, please contact the maintainers:

- [Bikram Sahoo]( <a href= "mailto:bikramsahoo@live.in">bikramsahoo@live.in</a>).