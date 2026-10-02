from tests.conftest import auth_header
from app.models import Equipment, Hospital, WorkOrder, Work_Order_Priority, Work_Order_Status, Technician

async def test_list_equipments_requires_auth(client, seeded_user):
    response = await client.get("/equipments")
    assert response.status_code == 401

async def test_list_equipments_any_authenticated_user(client, seeded_user):
    response = await client.get("/equipments", headers=auth_header(seeded_user["auditor"]))
    assert response.status_code == 200

async def test_create_equipments_forbidden_for_field_technician(client, seeded_user, seeded_hospital):
    payload = {
        "serial_number": 123456,
        "model": "XEA",
        "status": "Available",
        "battery_level": 50,
        "hospital_id": seeded_hospital.id,
    }
    response = await client.post("/equipments", json=payload, headers=auth_header(seeded_user["technician"]))
    assert response.status_code == 403

async def test_create_equipment_allowed_for_admin(client, seeded_user, seeded_hospital):
    payload = {
        "serial_number": 123456,
        "model": "XEA",
        "status": "Available",
        "battery_level": 50,
        "hospital_id": seeded_hospital.id,
    }
    response = await client.post("/equipments", json=payload, headers=auth_header(seeded_user["admin"]))
    assert response.status_code == 201
    assert response.json()["serial_number"] == payload["serial_number"]

async def test_delete_equipment_forbidden_for_field_technician(client, seeded_user, seeded_hospital):
    payload = {
            "serial_number": 123456,
            "model": "XEA",
            "status": "Available",
            "battery_level": 50,
            "hospital_id": seeded_hospital.id,
        }
    created = await client.post("/equipments", json=payload, headers=auth_header(seeded_user["admin"]))

    response = await client.delete(
        f"/equipments/{created.json()['id']}",
        headers=auth_header(seeded_user["technician"]),
    )

    assert response.status_code == 403

async def test_delete_equipment_allowed_for_admin(client, seeded_user, seeded_hospital):
    payload = {
        "serial_number": 123456,
        "model": "Model X",
        "status": "Available",
        "battery_level": 50,
        "hospital_id": seeded_hospital.id,
    }
    created = await client.post("/equipments", json=payload, headers=auth_header(seeded_user["admin"]))
    equipment_id = created.json()["id"]

    response = await client.delete(f"/equipments/{equipment_id}", headers=auth_header(seeded_user["admin"]))

    assert response.status_code == 204
    assert (await client.get(f"/equipments/equipment_id?equipment_id={equipment_id}", headers=auth_header(seeded_user["admin"]))).status_code == 404

async def test_delete_equipment_returns_not_found(client, seeded_user):
    response = await client.delete("/equipments/999999", headers=auth_header(seeded_user["admin"]))

    assert response.status_code == 404


async def test_reporting_lines_counts_distinct_technicians_with_active_orders(
    client, db_session, seeded_user, seeded_hospital
):
    second_hospital = Hospital(
        name="Other Hospital", location_region="Other Location", capacity=100, supervisor_id=20
    )
    technicians = [
        Technician(name="Tech One", hospital=seeded_hospital),
        Technician(name="Tech Two", hospital=seeded_hospital),
        Technician(name="Other Tech", hospital=second_hospital),
    ]
    equipments = [
        Equipment(serial_number=100001, model="Model A", battery_level=80, hospital=seeded_hospital),
        Equipment(serial_number=100002, model="Model A", battery_level=80, hospital=seeded_hospital),
        Equipment(serial_number=100003, model="Model A", battery_level=80, hospital=second_hospital),
    ]
    db_session.add_all([second_hospital, *technicians, *equipments])
    await db_session.flush()
    db_session.add_all([
        WorkOrder(
            title="Refill one", priority=Work_Order_Priority.LOW,
            status=Work_Order_Status.PENDING, equipment=equipments[0], technician=technicians[0],
        ),
        WorkOrder(
            title="Repair one", priority=Work_Order_Priority.MEDIUM,
            status=Work_Order_Status.IN_PROGRESS, equipment=equipments[1], technician=technicians[0],
        ),
        WorkOrder(
            title="Repair two", priority=Work_Order_Priority.CRITICAL,
            status=Work_Order_Status.COMPLETED, equipment=equipments[1], technician=technicians[1],
        ),
        WorkOrder(
            title="Other hospital call", priority=Work_Order_Priority.LOW,
            status=Work_Order_Status.PENDING, equipment=equipments[2], technician=technicians[2],
        ),
    ])
    await db_session.commit()

    response = await client.get(
        f"/work_orders/reporting_lines?supervisor_id={seeded_hospital.supervisor_id}",
        headers=auth_header(seeded_user["auditor"]),
    )

    assert response.status_code == 200
    assert response.json() == {
        "supervisor_id": seeded_hospital.supervisor_id,
        "technicians_with_active_calls": 1,
    }


async def test_reporting_lines_requires_auth(client, seeded_hospital):
    response = await client.get(
        f"/work_orders/reporting_lines?supervisor_id={seeded_hospital.supervisor_id}"
    )
    assert response.status_code == 401


async def verify_cash_level(client, seeded_user, seeded_hospital):
    admin_headers = auth_header(seeded_user["admin"])
    low_battery_equip = {
        "serial_number": 654321,
        "model": "YZA",
        "status": "Available",
        "battery_level": 10,
        "hospital_id": seeded_hospital.id,
    }
    response = await client.post("/equipments", json=low_battery_equip, headers=admin_headers)
    assert response.status_code == 201
    assert response.json()["cash_level"] == 10

    regular_equipment = {
        "serial_number": 123456,
        "model": "XEA",
        "status": "Available",
        "battery_level": 80,
        "hospital_id": seeded_hospital.id,
    }
    response = await client.post("/equipments", json=regular_equipment, headers=admin_headers)
    assert response.status_code == 201
    assert response.json()["battery_level"] == 80
