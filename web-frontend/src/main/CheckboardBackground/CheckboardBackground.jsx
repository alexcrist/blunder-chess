import _ from "lodash";
import styles from "./CheckboardBackground.module.css";

const CheckboardBackground = () => {
    return (
        <div className={styles.container}>
            <div className={styles.background}>
                {_.range(500).map((index) => {
                    return <div key={index} />;
                })}
            </div>
        </div>
    );
};

export default CheckboardBackground;
