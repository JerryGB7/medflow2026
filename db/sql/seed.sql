

INSERT INTO hospitals(id, name, location_region, capacity, supervisor_id) VALUES
    (1, 'Hospital 1', 'LA', 50, 10),
    (2, 'Hospital 2', 'SG', 50, 20),
    (3, 'Hospital 3', 'COM', 50, 30),
    (4, 'Hospital 4', 'ELM', 50, 40);

INSERT INTO technicians(id, name, hospital_id) VALUES
    (10, 'Susan',1),
    (11, 'Leon',1),
    (20, 'Barry',2),
    (21, 'Chloe',2),
    (30, 'Serine',3),
    (31, 'Grace',3),
    (40, 'Billy',4),
    (41, 'James',4),
    (90, 'Cyntia',1);    

INSERT INTO equipments(id, serial_number, model, status, battery_level, hospital_id, technician_id) VALUES
    (11, 89454, 'XEA', 'Available', 19, 1, 11),
    (12, 89455, 'XEA', 'Available', 100, 1, 21),
    (21, 22222, 'YSH', 'Available', 50, 2, 21),
    (22, 22223, 'YSH', 'Available', 15, 2, 21),
    (31, 3331, 'ZKI', 'Maintenance',100, 3, 31),
    (32, 3332, 'ZKI', 'Offline', 0, 3, 31),
    (41, 4441, 'ALM', 'In-Use', 19, 4, 41); 


INSERT INTO work_orders(id, title, priority, status, equipment_id, technician_id) VALUES
     (1, 'sensor not working','Critical', 'In-Progress', 31, 31),
     (2, 'sensor not working','Critical', 'In-Progress', 32, 31);

INSERT INTO diagnostic_reports(id, work_order_id, file_url, notes) VALUES
     (1, 1, 'demo.url', 'In-Progress'),
     (2, 2, 'demo.url', 'In-Progress');


SELECT setval('hospitals_id_seq', (SELECT MAX(id) FROM hosptials));
SELECT setval('technicians_id_seq', (SELECT MAX(id) FROM technicians));
SELECT setval('equipments_id_seq', (SELECT MAX(id) FROM equipments));
SELECT setval('work_orders_id_seq', (SELECT MAX(id) FROM work_orders));