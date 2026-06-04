import placeImage from "/images/detailPage/icons/marker.png";
import restaurantImage from "/images/detailPage/icons/coffee.png";
import eventImage from "/images/detailPage/icons/event.png";
import hotelImage from "/images/detailPage/icons/home.png";
import { Bookmark } from "lucide-react";
import styles from "./Card.module.css"
const Card = ({key, data , type, number, onClick}) => {
    const getImage = () => {
        switch(type) {
            case "place" : {
                return (placeImage);
                break;
            }
            case "restaurant" : {
                return (restaurantImage);
                break;
            } 
            case "hotel" : {
                return (hotelImage);
                break;
            } 
            case "event" : {
                return (eventImage);
                break;
            } 
            default : {
                return "";
            }
        }
    };
    return (
        <div className={styles["card-container"]}
        onClick={onClick}
        >
            <div className={styles.title}>
                <div className={styles["icon-container"]}>
                    <img src={getImage()} alt="icon" 
                    className={`${styles.icon}`} 
                    width={30}/>
                    <p
                     className={`${styles.order} ${type === "place" ? styles["order-place"] : ""} 
                     ${type === "restaurant" ? styles["order-restaurant"] : ""}`}
                     >{number}</p>
                </div>
                <p className={styles.name}>{data.name}</p>
            </div>
            <div className={styles.right}>
                <div className={styles["save-button"]}>
                    <p>Save</p>
                    <Bookmark  size={15}/> 
                </div>
                 <div className={styles["image-container"]}>
                    <img src={data.image} alt="image" className={styles["card-image"]}/>
                </div>
            </div>
        </div>
    );
}
export default Card;