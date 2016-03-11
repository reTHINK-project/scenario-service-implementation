<!--
@startuml "hotel-guest-application-UML-use-cases.png"

left to right direction
skinparam packageStyle rect

actor :Bob: as guest <<Hotel Guest>>
actor :Alice: as hotel <<Hotel Manager>>
actor :The Smarties: as dev <<Smart City\nAppliances Developer>>
actor :German Telekom: as dt <<Identity Management\nService Provider>>
actor :City of Bersabon: as city <<Catalogue Servide Provider>>

rectangle "Hotel Guest Application" {

	dt -- (Deploy IDM Service)
	(Deploy IDM Service) .> (Add User Identity Credentials) : <<includes>>
	guest -- (Add User Identity Credentials)

 	hotel -- (Create Hotel Guest Application)
 	dev -- (Create Hotel Guest Application)
 	(Create Hotel Guest Application) .> (Order Application) : <<includes>>
 	(Create Hotel Guest Application) .> (Implement Application) : <<includes>>
 	(Create Hotel Guest Application) .> (Deliver Application) : <<includes>>
 	(Order Application) .> (Specify Application\nRequirements) : <<includes>>

 
	hotel -- (Deploy Hotel Guest\nApplication in Catalogue)
	city -- (Deploy Hotel Guest\nApplication in Catalogue)
	
	guest -- (Make Hotel Reservation)
	(Make Hotel Reservation) .> (Browse Catalogue for\nHotel Guest Application) : <<includes>>
	(Make Hotel Reservation) .> (Retrieve Hotel Guest\nApplication from Catalogue) : <<includes>>
	(Make Hotel Reservation) .> (Select and Book Room) : <<includes>>
	(Select and Book Room) .> (Confirm Guest's\nIdentity with IDM Server) : <<includes>>
	(Make Hotel Reservation) .> (Select Available Amenities) : <<includes>>

}


@enduml
-->