"use client";

import { useState, useTransition } from 'react';
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';

interface TablePaginationProps {
    totalCount: number,
    pageSize?: number,
    onChangePage?: (page: number, pageSize: number) => {}
}

const TablePagination = ({ totalCount = 0, pageSize = 10, onChangePage }: TablePaginationProps) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [isPending, startTransition] = useTransition()
    const totalPages = Math.ceil(totalCount / pageSize);

    const handleChangePage = (page: number) => {
        if (page === currentPage) {
            return;
        }

        startTransition(async () => {
            setCurrentPage(page)
            await onChangePage?.(page, pageSize)
        })
    }

    const renderPageItem = (pageCount: number) => {
        return <PaginationItem
            key={`page_${pageCount}`}
            className='cursor-pointer'
            onClick={() => {
                if (!isPending) {
                    handleChangePage(pageCount)
                }
            }}>
            <PaginationLink isActive={currentPage === pageCount}>{pageCount}</PaginationLink>
        </PaginationItem >
    }

    return (<div className='rounded-md border border-border bg-card py-1 px-2 mt-2'>
        <Pagination className='mx-0 justify-end'>
            <PaginationContent>
                <PaginationItem className="cursor-pointer" onClick={() => {
                    if (currentPage > 1 && !isPending) {
                        handleChangePage(currentPage - 1);
                    }
                }}>
                    <PaginationPrevious />
                </PaginationItem>
                {
                    totalPages < 8 ? new Array(totalPages).fill(0).map((_, index) => {
                        return renderPageItem(index + 1);
                    }) : <>
                        {renderPageItem(1)}
                        {renderPageItem(2)}

                        {
                            currentPage === 3 ? renderPageItem(3) : null
                        }

                        {
                            currentPage > 3 && currentPage < (totalPages - 2) ?
                                <>
                                    <PaginationItem>
                                        <PaginationEllipsis />
                                    </PaginationItem>
                                    {renderPageItem(currentPage)}
                                    <PaginationItem>
                                        <PaginationEllipsis />
                                    </PaginationItem>
                                </> : <PaginationItem>
                                    <PaginationEllipsis />
                                </PaginationItem>
                        }

                        {
                            currentPage === totalPages - 2 ? renderPageItem(totalPages - 2) : null
                        }

                        {renderPageItem(totalPages - 1)}
                        {renderPageItem(totalPages)}
                    </>
                }

                <PaginationItem className="cursor-pointer" onClick={() => {
                    if (currentPage < totalPages && !isPending) {
                        handleChangePage(currentPage + 1);
                    }
                }}>
                    <PaginationNext />
                </PaginationItem>
            </PaginationContent>
        </Pagination>
    </div>)

}

export default TablePagination;