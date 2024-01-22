
# rentNmeter.receipt Server-side

This repository contains the server-side programming for the rentNmeter.receipt web application, specifically catering to landlord-related functionalities.

## Endpoints

### Create New Landlord User

- **Method**: POST
- **Endpoint**: /landlord
- **Description**: Create a new landlord user.

### Get All Landlord User Data

- **Method**: GET
- **Endpoint**: /landlord
- **Description**: Retrieve data for all landlord users.

### Get Single Landlord User Data

- **Method**: GET
- **Endpoint**: /landlord/user/:id
- **Description**: Retrieve data for a single landlord user based on the provided ID.

### Update Landlord User Data

- **Method**: PUT
- **Endpoint**: /landlord/user/:id
- **Description**: Update data for a specific landlord user.

### Delete Landlord User Data

- **Method**: DELETE
- **Endpoint**: /landlord/user/:id
- **Description**: Delete data for a specific landlord user.

### Login Landlord User

- **Method**: POST
- **Endpoint**: /landlord/login
- **Description**: Authenticate and login a landlord user with phone and password.

###  Create New Rent-Holder User

- **Method**: POST
- **Endpoint**: /rent-holder
- **Description**: Create a new rent holder user.

###  Get all Rent-Holder User

- **Method**: GET
- **Endpoint**: /rent-holder
- **Description**: Retrieve data for all rent-holder users.

###  Get Single Landlord User Data

- **Method**: GET
- **Endpoint**: /rent-holder/user/:id
- **Description**: Retrieve data for a single rent-holder user based on the provided ID.

###  Get all Rent-Holder User of specific landlord user.

- **Method**: GET
- **Endpoint**: /rent-holder/landlord
- **Description**: Retrieve data  all rent-holder user based on the landlord sign in.

###  Update Rent-Holder User Data.

- **Method**: PUT
- **Endpoint**: /rent-holder/user/:id
- **Description**: Update data for a specific rent-holder user.

### Delete Rent-Holder User Data

- **Method**: DELETE
- **Endpoint**: /rent-holder/user/:id
- **Description**: Delete data for a specific rent-holder user.

### Login Rent-Holder User

- **Method**: POST
- **Endpoint**: /rent-holder/login
- **Description**: Authenticate and login a rent-holder user with phone and password.

### Check Session of logged in User

- **Method**: POST
- **Endpoint**: /check-rout
- **Description**: Check the session status of user and send json data + {isActive,message}.

### Logout User

- **Method**: POST
- **Endpoint**: /logout
- **Description**: Logout user and send json data {isActive,message}.

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