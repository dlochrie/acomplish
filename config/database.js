module.exports = {
	"development": {
		"driver": "mysql",
		"host": "localhost",
		"database": "acomplish",
		"username": "dbuser",
		"password": "dbpasswd"
	}
	, "test": { 
		"driver": "memory"
	}
	, "production": { 
		"driver": "redis",
		"host": "localhost",
		"port": 6379
	}
};