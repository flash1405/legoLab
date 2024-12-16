# LEGO Lab

Our web application is designed to assist users in discovering creative ways to use their leftover Lego bricks. By helping users find new purposes for bricks that may not be part of any specific model, the app encourages creativity and exploration. Whether users have a few leftover bricks or an entire collection, the app aims to inspire builders to create models from what they thought was junk. We want to inspire resourcefulness and promote ideation in users to find originality within the universe predefined Lego Designs.

## Demo

https://github.com/user-attachments/assets/479c3eb6-03cb-4110-a0e9-aa324e6048fe

## Setup Instructions

1. Install MySQL 8.0
2. Install Node.js
3. Open in VSCode
4. Clone the repository
5. Open [data/](https://github.com/flash1405/legoLab/tree/main/data) and use the database dump to load up your My SQL Install
7. Open [dev/legolab/](https://github.com/flash1405/legoLab/tree/main/dev/legolab)
8. Create .env file with and define the following variables as per the given example and your local My SQL Instance
   ```
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=password
   DB_NAME=legolab
   PORT=3000
   JWT_SECRET=BANANAS
   ```
10. Run ```npm install``` 
11. Run ```npm start```


### Database UML Diagram
![alt text](https://github.com/flash1405/legoLab/blob/main/doc/stage2_UML.png)

Source - [Rebrickable Datasets](https://rebrickable.com/downloads/)

## License

[MIT](https://choosealicense.com/licenses/mit/)
