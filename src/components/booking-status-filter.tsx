"use client"

import * as React from "react"
import { bookingStatusOptions, paymentStatusOptions } from "@/types/booking"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { IconFilter } from "@tabler/icons-react"
import { Table } from "@tanstack/react-table"
import { Booking } from "@/types/booking"

interface BookingStatusFilterProps {
  table: Table<Booking>
}

export function BookingStatusFilter({ table }: BookingStatusFilterProps) {
  const [selectedStatuses, setSelectedStatuses] = React.useState<string[]>(
    (table.getColumn("status")?.getFilterValue() as string[]) || []
  )
  const [selectedPaymentStatuses, setSelectedPaymentStatuses] = React.useState<string[]>(
    (table.getColumn("paymentStatus")?.getFilterValue() as string[]) || []
  )

  const handleStatusChange = (status: string, checked: boolean) => {
    const newStatuses = checked
      ? [...selectedStatuses, status]
      : selectedStatuses.filter(s => s !== status)
    
    setSelectedStatuses(newStatuses)
    table.getColumn("status")?.setFilterValue(newStatuses.length ? newStatuses : undefined)
  }

  const handlePaymentStatusChange = (status: string, checked: boolean) => {
    const newStatuses = checked
      ? [...selectedPaymentStatuses, status]
      : selectedPaymentStatuses.filter(s => s !== status)
    
    setSelectedPaymentStatuses(newStatuses)
    table.getColumn("paymentStatus")?.setFilterValue(newStatuses.length ? newStatuses : undefined)
  }

  const clearFilter = () => {
    setSelectedStatuses([])
    setSelectedPaymentStatuses([])
    table.getColumn("status")?.setFilterValue(undefined)
    table.getColumn("paymentStatus")?.setFilterValue(undefined)
  }

  const totalFilters = selectedStatuses.length + selectedPaymentStatuses.length

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 border-dashed ml-auto">
          <IconFilter className="mr-2 h-4 w-4" />
          Filtry
          {totalFilters > 0 && (
            <Badge variant="secondary" className="ml-2 px-1.5">
              {totalFilters}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <div className="px-2 py-1.5 text-sm font-semibold">Status rezerwacji</div>
        {bookingStatusOptions.map((option) => (
          <DropdownMenuCheckboxItem
            key={`status-${option.value}`}
            checked={selectedStatuses.includes(option.value)}
            onCheckedChange={(checked) => handleStatusChange(option.value, checked)}
          >
            <span className={option.color}>{option.label}</span>
          </DropdownMenuCheckboxItem>
        ))}
        
        <div className="my-2 h-px bg-border" />
        
        <div className="px-2 py-1.5 text-sm font-semibold">Status płatności</div>
        {paymentStatusOptions.map((option) => (
          <DropdownMenuCheckboxItem
            key={`payment-${option.value}`}
            checked={selectedPaymentStatuses.includes(option.value)}
            onCheckedChange={(checked) => handlePaymentStatusChange(option.value, checked)}
          >
            <span className={option.color}>{option.label}</span>
          </DropdownMenuCheckboxItem>
        ))}
        
        {totalFilters > 0 && (
          <>
            <div className="my-2 h-px bg-border" />
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-muted-foreground"
              onClick={clearFilter}
            >
              Wyczyść wszystkie filtry
            </Button>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}