DELIMITER $$

DROP PROCEDURE GetBuildDetails;
CREATE PROCEDURE GetBuildDetails(
    IN user_id_param VARCHAR(100)
)
BEGIN
    -- Declare variables
    DECLARE active_build_id VARCHAR(100);

    -- Step 1: Get the active build ID for the user
    SELECT current_build_id INTO active_build_id
    FROM users
    WHERE user_id = user_id_param;

    -- Step 2: Fetch build details
    SELECT 
        b.build_id,
        b.build_name,
        b.build_png,
        b.build_link,
        b.build_age_rating,
        b.build_rating,
        b.build_release_year
    FROM builds b
    WHERE b.build_id = active_build_id;

    -- Step 3: Fetch parts required for the active build
    SELECT 
        bd.part_id,
        bd.part_color,
        bd.part_quantity AS required_quantity,
        p.part_name,
        p.part_color
    FROM build_details bd
    INNER JOIN parts p ON bd.part_id = p.part_id AND bd.part_color = p.part_color
    WHERE bd.build_id = active_build_id;

    -- Step 4: Fetch the user's inventory for the required parts
    SELECT 
		p.part_name,
        p.part_png,
        p.part_dimensions,
        i.part_id,
        i.part_color,
        i.part_quantity AS user_quantity
    FROM inventory i
    JOIN Parts p ON p.part_id = i.part_id AND p.part_color = i.part_color
    WHERE i.user_id = user_id_param
    AND EXISTS (
        SELECT 1 
        FROM build_details bd 
        WHERE bd.build_id = active_build_id 
        AND bd.part_id = i.part_id 
        AND bd.part_color = i.part_color
    );

    -- Step 5: Fetch missing parts and lowest prices
    SELECT 
        bd.part_id,
        bd.part_color,
        bd.part_quantity AS required_quantity,
        p.part_name,
        p.part_color,
        p.part_png, 
        p.part_dimensions,
        COALESCE(MIN(pp.part_price), 0) AS lowest_price
    FROM build_details bd
    INNER JOIN parts p ON bd.part_id = p.part_id AND bd.part_color = p.part_color
    LEFT JOIN part_pricing pp ON pp.part_id = bd.part_id AND pp.part_color = bd.part_color
    WHERE bd.build_id = active_build_id
    AND NOT EXISTS (
        SELECT 1 
        FROM inventory i 
        WHERE i.user_id = user_id_param 
        AND i.part_id = bd.part_id 
        AND i.part_color = bd.part_color
        AND i.part_quantity >= bd.part_quantity
    )
    GROUP BY bd.part_id, bd.part_color, bd.part_quantity, p.part_name, p.part_color;

END $$

DELIMITER ;
