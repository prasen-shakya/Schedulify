class Event {
  constructor(eventID, userID, name, description, startDate, endDate) {
    this.eventID = eventID;
    this.userID = userID;
    this.name = name;
    this.description = description;
    this.startDate = startDate;
    this.endDate = endDate;
  }
}

export default Event;
