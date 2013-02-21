module.exports = {
		"development": {
			driver: "redis",
			host: "localhost",
      port: 6379
		}
  , "test": { 
			"driver":   "memory"
		}
  , "production": { 
			"driver":   "memory"
		}
  };
