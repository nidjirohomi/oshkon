import { BookingExperience } from "../../../components/booking-experience";

export default function RestaurantPage({ params }: { params: { id: string } }) {
  return <BookingExperience initialRestaurant={params.id} />;
}
