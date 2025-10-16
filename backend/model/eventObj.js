const eventIDSize = 1000000000;

class Event{
    constructor(userID, name, description, startDate, endDate){
        this.organizer = userID;
        this.name = name;
        this.description = description;
        this.startDate = startDate;
        this.endDate = endDate;

        this.eventID = this.generateID();
    }

    generateID(){
        var temp = Math.random() * eventIDSize;

        // check that no other ID's like this exist

        return temp;
    }
}