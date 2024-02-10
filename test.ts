class Connection {
    private static connection: Connection = null;

    private constructor() {
        console.log('Connection created')
    }


    static getConnection() {
        if (connection === null) {
            connection = new Connection();
        }
        return connection;

    }

}

// static method can be called without creating an instance of the class
let connection = Connection.getConnection();
let connection1 = Connection.getConnection();
// methode
// let connection2 = new Connection();
// connection2.getConnection(); // error