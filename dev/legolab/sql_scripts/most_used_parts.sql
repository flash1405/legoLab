DELIMITER $$

CREATE PROCEDURE GetMostFrequentParts()
BEGIN
    SELECT DISTINCT lp.part_id, lp.part_name, SUM(bd.part_quantity) AS total_quantity_used
    FROM PARTS AS lp
    JOIN BUILD_DETAILS AS bd ON lp.part_id = bd.part_id
    GROUP BY lp.part_id, lp.part_name
    ORDER BY total_quantity_used DESC, lp.part_name;
END $$

DELIMITER ;

#Stored procedure-2 for the builds with most variety of parts used.
DELIMITER $$

CREATE PROCEDURE GetBuildsWithMostUniqueParts()
BEGIN
    SELECT lb.build_id, lb.build_name, COUNT(DISTINCT bd.part_id, bd.part_color) AS unique_part_count
    FROM BUILDS AS lb
    JOIN BUILD_DETAILS AS bd ON lb.build_id = bd.build_id
    GROUP BY lb.build_id, lb.build_name
    ORDER BY unique_part_count DESC, lb.build_name;
END $$

DELIMITER ;

#Stored Procedure-3 for giving builds with above average ratings in last 5 years
DELIMITER $$

CREATE PROCEDURE GetTopRatedRecentBuilds()
BEGIN
    SELECT build_id, build_name, build_release_year, build_rating
    FROM BUILDS
    WHERE build_release_year >= YEAR(CURDATE()) - 5
    AND build_rating > (
        SELECT AVG(build_rating)
        FROM BUILDS
        WHERE build_release_year >= YEAR(CURDATE()) - 5
    )
    ORDER BY build_release_year DESC, build_rating DESC;
END $$

DELIMITER ;

#trigger 1 update to inventory trigger

DELIMITER $$

CREATE TRIGGER update_user_inventory
AFTER INSERT ON INVENTORY
FOR EACH ROW
BEGIN
    -- Check if the part already exists in the inventory for the user
    IF EXISTS (
        SELECT 1
        FROM INVENTORY
        WHERE user_id = NEW.user_id
          AND part_id = NEW.part_id
          AND part_color = NEW.part_color
    ) THEN
        -- Update the quantity of the existing part
        UPDATE INVENTORY
        SET part_quantity = part_quantity + NEW.part_quantity
        WHERE user_id = NEW.user_id
          AND part_id = NEW.part_id
          AND part_color = NEW.part_color;
    ELSE
        -- Insert the new part if it does not exist (this is the default behavior of INSERT)
        INSERT INTO INVENTORY (user_id, part_id, part_color, part_quantity)
        VALUES (NEW.user_id, NEW.part_id, NEW.part_color, NEW.part_quantity);
    END IF;
END$$

DELIMITER ;