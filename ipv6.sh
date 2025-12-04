enable
configure terminal
hostname R1
interface GigabitEthernet0/0/0
ipv6 address FD00:0:0:10::1/64
no shutdown
exit
interface Serial0/1/0
ipv6 address 2001:DB8:0:10::1/64
clock rate 64000
no shutdown
exit
interface Serial0/1/1
ipv6 address 2001:DB8:0:20::1/64
clock rate 64000
no shutdown
exit
ipv6 unicast-routing
ipv6 router ospf 10
router-id 1.1.1.1
exit
interface GigabitEthernet0/0/0
ipv6 ospf 10 area 0
exit
interface Serial0/1/0
ipv6 ospf 10 area 0
exit
interface Serial0/1/1
ipv6 ospf 10 area 0
end
copy running-config startup-config

------------------------------------












ROTEADOR 1
enable
configure terminal
hostname R1
ipv6 unicast-routing
interface GigabitEthernet0/0/0
no ipv6 address
no shutdown
exit
interface GigabitEthernet0/0/0.15
encapsulation dot1q 19
ipv6 address FD00:0:0:19::1/64
ipv6 ospf 10 area 0
exit
interface GigabitEthernet0/0/0.25
encapsulation dot1q 29
ipv6 address FD00:0:0:59::1/64
ipv6 ospf 10 area 0
exit
interface Serial0/1/0
ipv6 address 2001:DB8:0:12::1/64
clock rate 64000
no shutdown
ipv6 ospf 10 area 0
exit
interface Serial0/1/1
ipv6 address 2001:DB8:0:41::2/64
no shutdown
ipv6 ospf 10 area 0
exit
ipv6 router ospf 10
router-id 1.1.1.1
end
copy running-config startup-config

ROTEADOR 2
enable
configure terminal
hostname R2
ipv6 unicast-routing
interface GigabitEthernet0/0/0
no ipv6 address
no shutdown
exit
interface GigabitEthernet0/0/0.15
encapsulation dot1q 19
ipv6 address FD00:0:0:29::1/64
ipv6 ospf 10 area 0
exit
interface GigabitEthernet0/0/0.25
encapsulation dot1q 29
ipv6 address FD00:0:0:69::1/64
ipv6 ospf 10 area 0
exit
interface Serial0/1/0
ipv6 address 2001:DB8:0:12::2/64
no shutdown
ipv6 ospf 10 area 0
exit
interface Serial0/1/1
ipv6 address 2001:DB8:0:23::1/64
clock rate 64000
no shutdown
ipv6 ospf 10 area 0
exit
ipv6 router ospf 10
router-id 2.2.2.2
end
copy running-config startup-config

ROTEADOR 3
enable
configure terminal
hostname R3
ipv6 unicast-routing
interface GigabitEthernet0/0/0
no ipv6 address
no shutdown
exit
interface GigabitEthernet0/0/0.15
encapsulation dot1q 19
ipv6 address FD00:0:0:39::1/64
ipv6 ospf 10 area 0
exit
interface GigabitEthernet0/0/0.25
encapsulation dot1q 29
ipv6 address FD00:0:0:79::1/64
ipv6 ospf 10 area 0
exit
interface Serial0/1/0
ipv6 address 2001:DB8:0:23::2/64
no shutdown
ipv6 ospf 10 area 0
exit
interface Serial0/1/1
ipv6 address 2001:DB8:0:34::1/64
clock rate 64000
no shutdown
ipv6 ospf 10 area 0
exit
ipv6 router ospf 10
router-id 3.3.3.3
end
copy running-config startup-config

ROTEADOR 4
enable
configure terminal
hostname R4
ipv6 unicast-routing
interface GigabitEthernet0/0/0
no ipv6 address
no shutdown
exit
interface GigabitEthernet0/0/0.15
encapsulation dot1q 19
ipv6 address FD00:0:0:49::1/64
ipv6 ospf 10 area 0
exit
interface GigabitEthernet0/0/0.25
encapsulation dot1q 29
ipv6 address FD00:0:0:89::1/64
ipv6 ospf 10 area 0
exit
interface Serial0/1/0
ipv6 address 2001:DB8:0:34::2/64
no shutdown
ipv6 ospf 10 area 0
exit
interface Serial0/1/1
ipv6 address 2001:DB8:0:41::1/64
clock rate 64000
no shutdown
ipv6 ospf 10 area 0
exit
ipv6 router ospf 10
router-id 4.4.4.4
end
copy running-config startup-config

--------------------------------------

VLANS:

enable
configure terminal
hostname S1
vlan 19
name VLAN19
exit
vlan 29
name VLAN29
exit
interface range fastEthernet 0/1-2
switchport mode access
switchport access vlan 19
exit
interface range fastEthernet 0/3-4
switchport mode access
switchport access vlan 29
exit
interface gigabitEthernet 0/1
switchport mode trunk
end
copy running-config startup-config

===========

enable
configure terminal
hostname S2
vlan 19
name VLAN19
exit
vlan 29
name VLAN29
exit
interface range fastEthernet 0/1-2
switchport mode access
switchport access vlan 19
exit
interface range fastEthernet 0/3-4
switchport mode access
switchport access vlan 29
exit
interface gigabitEthernet 0/1
switchport mode trunk
end
copy running-config startup-config


===========

enable
configure terminal
hostname S3
vlan 19
name VLAN19
exit
vlan 29
name VLAN29
exit
interface range fastEthernet 0/1-2
switchport mode access
switchport access vlan 19
exit
interface range fastEthernet 0/3-4
switchport mode access
switchport access vlan 29
exit
interface gigabitEthernet 0/1
switchport mode trunk
end
copy running-config startup-config

==========

enable
configure terminal
hostname S4
vlan 19
name VLAN19
exit
vlan 29
name VLAN29
exit
interface range fastEthernet 0/1-2
switchport mode access
switchport access vlan 19
exit
interface range fastEthernet 0/3-4
switchport mode access
switchport access vlan 29
exit
interface gigabitEthernet 0/1
switchport mode trunk
end
copy running-config startup-config
