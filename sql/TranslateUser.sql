/*DROP TABLE TranslateUser;*/


CREATE TABLE TranslateUser
(
    id int not null AUTO_INCREMENT
    
    ,GUID varchar(255)
    
	,createdAt timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
    ,updatedAt timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP

	,humanId varchar(255)
	,name varchar(255)

	,code varchar(255)
    
    ,email varchar(255)
    ,token varchar(255)
    ,avatar longtext
    ,password varchar(255)
    ,humanName varchar(255)
    ,language varchar(255)
    
	,PRIMARY KEY (id)
    
);

