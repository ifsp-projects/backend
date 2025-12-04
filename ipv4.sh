ROTEADORES:

enable
configure terminal
hostname R1
interface GigabitEthernet0/0/0
ip address 192.168.15.1 255.255.255.0
no shutdown
exit
interface Serial0/1/0
ip address 203.0.113.1 255.255.255.252
clock rate 64000
no shutdown
exit
interface Serial0/1/1
ip address 203.0.113.14 255.255.255.252
clock rate 64000
no shutdown
exit
router ospf 10
network 192.168.15.0 0.0.0.255 area 0
network 203.0.113.0 0.0.0.3 area 0
network 203.0.113.12 0.0.0.3 area 0
end
copy running-config startup-config

=============

enable
configure terminal
hostname R2
interface GigabitEthernet0/0/0
ip address 192.168.25.1 255.255.255.0
no shutdown
exit
interface Serial0/1/0
ip address 203.0.113.2 255.255.255.252
no shutdown
exit
interface Serial0/1/1
ip address 203.0.113.5 255.255.255.252
clock rate 64000
no shutdown
exit
router ospf 10
network 192.168.25.0 0.0.0.255 area 0
network 203.0.113.0 0.0.0.3 area 0
network 203.0.113.4 0.0.0.3 area 0
end
copy running-config startup-config

====================

enable
configure terminal
hostname R3
interface GigabitEthernet0/0/0
ip address 192.168.35.1 255.255.255.0
no shutdown
exit
interface Serial0/1/0
ip address 203.0.113.6 255.255.255.252
no shutdown
exit
interface Serial0/1/1
ip address 203.0.113.9 255.255.255.252
clock rate 64000
no shutdown
exit
router ospf 10
network 192.168.35.0 0.0.0.255 area 0
network 203.0.113.4 0.0.0.3 area 0
network 203.0.113.8 0.0.0.3 area 0
end
copy running-config startup-config

=========================

enable
configure terminal
hostname R4
interface GigabitEthernet0/0/0
ip address 192.168.45.1 255.255.255.0
no shutdown
exit
interface Serial0/1/0
ip address 203.0.113.10 255.255.255.252
no shutdown
exit
interface Serial0/1/1
ip address 203.0.113.13 255.255.255.252
clock rate 64000
no shutdown
exit
router ospf 10
network 192.168.45.0 0.0.0.255 area 0
network 203.0.113.8 0.0.0.3 area 0
network 203.0.113.12 0.0.0.3 area 0
end
copy running-config startup-config

--------------------------------------------------------------

VLANS:

enable
configure terminal
hostname S1
vlan 15
name VLAN15
exit
vlan 25
name VLAN25
exit
interface range fastEthernet 0/1-2
switchport mode access
switchport access vlan 15
exit
interface range fastEthernet 0/3-4
switchport mode access
switchport access vlan 25
exit
interface gigabitEthernet 0/1
switchport mode trunk
end
copy running-config startup-config

===========

enable
configure terminal
hostname S2
vlan 15
name VLAN15
exit
vlan 25
name VLAN25
exit
interface range fastEthernet 0/1-2
switchport mode access
switchport access vlan 15
exit
interface range fastEthernet 0/3-4
switchport mode access
switchport access vlan 25
exit
interface gigabitEthernet 0/1
switchport mode trunk
end
copy running-config startup-config

===========

enable
configure terminal
hostname S3
vlan 15
name VLAN15
exit
vlan 25
name VLAN25
exit
interface range fastEthernet 0/1-2
switchport mode access
switchport access vlan 15
exit
interface range fastEthernet 0/3-4
switchport mode access
switchport access vlan 25
exit
interface gigabitEthernet 0/1
switchport mode trunk
end
copy running-config startup-config

==========

enable
configure terminal
hostname S4
vlan 15
name VLAN15
exit
vlan 25
name VLAN25
exit
interface range fastEthernet 0/1-2
switchport mode access
switchport access vlan 15
exit
interface range fastEthernet 0/3-4
switchport mode access
switchport access vlan 25
exit
interface gigabitEthernet 0/1
switchport mode trunk
end
copy running-config startup-config
